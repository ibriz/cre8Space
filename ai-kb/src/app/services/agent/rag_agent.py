from impl import LoggerImpl
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from services.llm.utils import openai_client
from services.prompt.v1.qa import prompt_template as qa_prompt_template

from .state import RAGGraphState
from .tools import documents_retriever

logger_impl = LoggerImpl(__name__)
logger = logger_impl.get_logger()

tools = [documents_retriever]


async def agent_call(state: RAGGraphState):
    try:
        logger.info("Initializing Agent..")
        messages = state["messages"]
        model = openai_client.initialize_model(model="gpt-4o-mini") # small model for agent
        model = model.bind_tools(tools)
        response = await model.ainvoke(messages)
        return {"messages": [response], "answer": response.content}
    except Exception as e:
        logger.error(f"Agent: Error in agent call {str(e)}")
        raise e


async def generate_qa_response(state: RAGGraphState):
    try:
        logger.info("Generating Response..")
        messages = state["messages"]
        question = messages[1].content
        last_message = messages[-1]
        
        docs = eval(last_message.content)
        context = "\n\n".join([doc["content"] for doc in docs])

        response = await openai_client.async_generate(
            prompt_template=qa_prompt_template,
            query={"context": context, "question": question},
        )
        answer = response.content
        
        docs = [] if "i don't know" in answer.lower() else docs

        return {"messages": [response], "documents": docs, "answer": answer}
    except Exception as e:
        logger.error(f"Agent: Error in generating query response {str(e)}")
        raise (e)


workflow = StateGraph(RAGGraphState)
workflow.add_node("agent", agent_call)
workflow.add_node("retrieve", ToolNode(tools))
workflow.add_node("generate", generate_qa_response)

workflow.add_edge(START, "agent")
workflow.add_conditional_edges(
    "agent", tools_condition, {"tools": "retrieve", END: END}
)
workflow.add_edge("retrieve", "generate")
workflow.add_edge("generate", END)

rag_agent = workflow.compile()
