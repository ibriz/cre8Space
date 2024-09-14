/// Module: CEP
module content_monitize::cep {
    
    // === Imports ===

    use std::string::{String};
    use sui::table::{Self, Table};
    use sui::vec_set::{Self, VecSet};
    use content_monitize::roles::{AdminCap};
    
    // === Errors ===

    const EUserAlreadyLikedPost: u64 = 2;
    const EBlobIdNotExist: u64 = 4;
    const EUserNotExist: u64 = 100;
    const EAlreadyRegisteredBlob: u64 = 101;

    // === Constant ===

    const INCREASE_ONE_POINT: u64 = 1;

    // === Structs ===

    public struct ContentInfo has key, store {
        id: UID,
        content_used_points: Table<String, u64>, // blob_id => u64
        total_accrued_points: Table<address, u64>, // content_creator => u64 
        content_like_count: Table<String, VecSet<address>>, 
        registered_content: vector<address>,
        content_creator: Table<String, address>  
    }

    public struct Content has key, store {
        id: UID, 
        blob_id: String, 
        owner: address, 
        title: String, 
        description: String, 
        tag: String,
        file_type: String, 
        encrypted_obj: String
    }

    // === Init Function ===

    fun init(ctx: &mut TxContext) {

        let content_details = ContentInfo {
            id: object::new(ctx),
            content_used_points: table::new(ctx), 
            total_accrued_points: table::new(ctx),
            content_like_count: table::new(ctx),
            registered_content: vector::empty(),
            content_creator: table::new(ctx)
        };

        transfer::share_object(content_details);
    }

    // === Admin Functions ===

    // Function used to incentivize the content
    public fun content_incentivized(_cap: &AdminCap, blob_id: String, contents_info: &mut ContentInfo) {
        // increasing content accrued points
        let borrow_mut_prev_content_accrued_points = contents_info.content_used_points.borrow_mut<String, u64>(blob_id);
        *borrow_mut_prev_content_accrued_points = *borrow_mut_prev_content_accrued_points + INCREASE_ONE_POINT;

        // increasing total accrued points
        let content_creator = table::borrow(&contents_info.content_creator, blob_id);
        let borrow_mut_prev_total_accrued_points = contents_info.total_accrued_points.borrow_mut<address, u64>(*content_creator);
        *borrow_mut_prev_total_accrued_points = *borrow_mut_prev_total_accrued_points + INCREASE_ONE_POINT;
    }

    // === Public Functions ===

    #[allow(lint(self_transfer))]
    public fun mint_content (
        title: String,
        description: String,
        tag: String, 
        file_type: String,
        blob_id: String, 
        contents_info: &mut ContentInfo,
        encrypted_obj: String,
        ctx: &mut TxContext
    ) {
        // check if the content is already created using the blob id.
        assert!(!contents_info.content_like_count.contains<String, VecSet<address>>(blob_id), EAlreadyRegisteredBlob);

        let sender = ctx.sender();
        let content = Content {
            id: object::new(ctx),  
            blob_id, 
            owner: sender, 
            title,
            description, 
            tag,
            file_type, 
            encrypted_obj
        }; 

        table::add(&mut contents_info.content_creator, blob_id, sender);

        // Initializing the content liked field
        let content_liked_by: VecSet<address> = vec_set::empty();
        contents_info.content_like_count.add<String, VecSet<address>>(blob_id, content_liked_by);
        contents_info.registered_content.push_back(object::uid_to_address(&content.id)); // content ID pushed to register content

        // Initializing the points accrued by content
        contents_info.content_used_points.add<String, u64>(blob_id, 0);

        if(!contents_info.total_accrued_points.contains(sender)) {
            contents_info.total_accrued_points.add<address, u64>(sender, 0); 
        };

        // transfer the content ownership to sender
        transfer::transfer(content, sender);
    }

    public fun like_content(blob_id: String, contents_info: &mut ContentInfo, ctx: &mut TxContext) {
        let sender = ctx.sender();
        
        let borrow_mut_content_liked_details = contents_info.content_like_count.borrow_mut<String, VecSet<address>>(blob_id);
        // check if the content is already liked by the user
        assert!(!borrow_mut_content_liked_details.contains(&sender), EUserAlreadyLikedPost);

        borrow_mut_content_liked_details.insert(sender);

        // increasing the total accrued point of the content creator
        let content_creator = table::borrow(&contents_info.content_creator, blob_id);

        // check if the user already has point or not and act accordingly
        let borrow_mut_prev_total_accrued_points = contents_info.total_accrued_points.borrow_mut<address, u64>(*content_creator);
        *borrow_mut_prev_total_accrued_points = *borrow_mut_prev_total_accrued_points + INCREASE_ONE_POINT;
        
    }  

    public fun get_like(contents_info: &ContentInfo, blob_id: String): u64 {
        assert!(contents_info.content_like_count.contains(blob_id), EBlobIdNotExist);
        let liked_address = contents_info.content_like_count.borrow<String, VecSet<address>>(blob_id);
        liked_address.size()
    }

    public fun get_registered_content(contents_info: &ContentInfo) : vector<address> {
        contents_info.registered_content
    }

    public fun get_content_liked_address(contents_info:&ContentInfo, blob_id: String): VecSet<address>{
        assert!(contents_info.content_like_count.contains(blob_id), EBlobIdNotExist);
        let liked_address = contents_info.content_like_count.borrow<String, VecSet<address>>(blob_id);
        *liked_address
    }

    public fun get_content_accrued_points(contents_info: &ContentInfo, blob_id: String): u64{
        assert!(contents_info.content_used_points.contains(blob_id), EBlobIdNotExist);
        let content_accrued_points = contents_info.content_used_points.borrow<String, u64>(blob_id); 
        *content_accrued_points
    }

    public fun get_total_accrued_points(contents_info: &ContentInfo, user: address): u64 {
        assert!(contents_info.total_accrued_points.contains(user), EUserNotExist); 
        let total_accured_points = contents_info.total_accrued_points.borrow<address, u64>(user);
        *total_accured_points
    }

    public fun check_content_like(contents_info: &ContentInfo, blob_id: String, user_address: address): bool {
        let user_contains = contents_info.content_like_count.borrow<String, VecSet<address>>(blob_id);
        let flag: bool;
        if(user_contains.contains(&user_address)){
            flag = true;
        }else {
            flag = false;
        };
        flag
    }

    // initializing for testing
    #[test_only]
    public fun test_init(ctx: &mut TxContext) {
        init(ctx);
    }
}