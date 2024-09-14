module content_monitize::roles {
    
    // === Structs ===

    public struct AdminCap has key, store {
        id: UID,
    }

    // === Init Function ===

    fun init(ctx: &mut TxContext) {
        transfer::transfer(AdminCap {
            id: object::new(ctx)
        }, tx_context::sender(ctx));
    }

    #[test_only]
    public fun test_init(ctx: &mut TxContext) {
        init(ctx);
    }

}