from impl import LoggerImpl
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from services.llm.utils import openai_client

from .state import IngestGraphState
from .tools import generate_category_tags

logger_impl = LoggerImpl(__name__)
logger = logger_impl.get_logger()

tools = [generate_category_tags]


def create_chunk_to_categorize(state: IngestGraphState):
    try:
        logger.info("Creating chunk to categorize...")
        chunks = state["documents"]
        if len(chunks) > 0:
            chunk = state["documents"].pop(0)
            return {
                "messages": [
                    f"Categorize the following chunk \n\n Chunk:\n\n {chunk.page_content}"
                ]
            }
        return {"messages": "END"}
    except Exception as e:
        logger.error(f"Ingest Agent Error in creating chunk {str(e)}")
        raise e


async def add_to_category(state: IngestGraphState):
    try:
        logger.info("Adding to tags list...")
        last_message = state["messages"][-1].content
        state["tags"].extend(eval(last_message))
    except Exception as e:
        logger.error(f"Ingest Agent Error in adding to category {str(e)}")
        raise e


async def agent_call(state: IngestGraphState):
    try:
        logger.info("Calling agent..")
        messages = state["messages"]
        model = openai_client.initialize_model()
        model = model.bind_tools(tools)
        response = await model.ainvoke(messages)
        return {"messages": [response]}
    except Exception as e:
        raise e


workflow = StateGraph(IngestGraphState)
workflow.add_node("create_chunk", create_chunk_to_categorize)
workflow.add_node("agent", agent_call)
workflow.add_node("categorize", ToolNode(tools))
workflow.add_node("add_to_category", add_to_category)

workflow.add_edge(START, "create_chunk")
workflow.add_edge("create_chunk", "agent")
workflow.add_conditional_edges(
    "agent", tools_condition, {"tools": "categorize", END: END}
)
workflow.add_edge("categorize", "add_to_category")
workflow.add_edge("add_to_category", "create_chunk")

categorize_agent = workflow.compile()
