#[test_only] 
module content_monitize::content_monitize_test {
    use std::debug; 
    use sui::test_utils::assert_eq;
    use sui::test_scenario::{Self as ts, Scenario, next_tx, ctx}; 
    use std::string::{Self}; 
    use content_monitize::roles::{Self, AdminCap};
    use content_monitize::cep::{Self, ContentInfo, Content};  

    const OWNER: address = @0xBABE; 
    const JOE: address = @0xACDE;
    const HARRY: address = @0xADCD;
    const ALICE: address = @0xA11CE; 
    const BOB: address = @0xBBAB; 

    public struct World {
        scenario: Scenario, 
        admin_cap: AdminCap, 
        shared_content: ContentInfo, 
    }

    public fun start_world(): World {
        let mut scenario = ts::begin(OWNER); 
        roles::test_init(ctx(&mut scenario));
        cep::test_init(ctx(&mut scenario));

        next_tx(&mut scenario, OWNER);

        let admin_cap = ts::take_from_sender<AdminCap>(&scenario); 
        let shared_content = ts::take_shared<ContentInfo>(&scenario);

        World {
            scenario,
            admin_cap, 
            shared_content
        }
    }

    public fun end_world(world: World) {
        let World {
            scenario, 
            admin_cap,  
            shared_content
        } = world;

        ts::return_to_sender<AdminCap>(&scenario, admin_cap); 
        ts::return_shared<ContentInfo>(shared_content); 

        scenario.end();
    }

    #[test] 
    fun publish_package() {
        let world = start_world();
        end_world(world);
    }

    /*
        Mint_content
        - Anyone cna mint content with generated_blob_id
        - none can mint_content with same blob_id check it
    */
    #[test]
    public fun test_mint_content() {
        let mut world = start_world();
        
        // ALICE is about to mint the content
        next_tx(&mut world.scenario, ALICE); 

        cep::mint_content(
            b"new_title".to_string(), 
            b"description".to_string(),
            b"tag".to_string(),
            b"file_type".to_string(),
            b"blob123".to_string(), 
            &mut world.shared_content,
            b"encrypted_nft".to_string(), 
            ctx(&mut world.scenario),
        );

        next_tx(&mut world.scenario, OWNER);
        end_world(world);
    }

    #[test, expected_failure(abort_code=content_monitize::cep::EAlreadyRegisteredBlob)] 
    public fun test_mint_content_with_same_blob() {
        let mut world = start_world();
        
        // ALICE is about to mint the content
        next_tx(&mut world.scenario, ALICE); 

        cep::mint_content(
            b"new_title".to_string(), 
            b"description".to_string(),
            b"tag".to_string(),
            b"file_type".to_string(),
            b"blob123".to_string(), 
            &mut world.shared_content,
            b"encrypted_nft".to_string(), 
            ctx(&mut world.scenario),
        );

        // BOB is about to mint the same blob_id
        next_tx(&mut world.scenario, BOB);
        cep::mint_content(
            b"new_title".to_string(), 
            b"description".to_string(),
            b"tag".to_string(),
            b"file_type".to_string(),
            b"blob123".to_string(), 
            &mut world.shared_content,
            b"encrypted_nft".to_string(), 
            ctx(&mut world.scenario),
        );

        next_tx(&mut world.scenario, OWNER);
        end_world(world);

    }

    #[test]
    public fun test_mint_content_with_different_blob() {
        let mut world = start_world();
        
        // ALICE is about to mint the content
        next_tx(&mut world.scenario, ALICE); 

        cep::mint_content(
            b"new_title".to_string(), 
            b"description".to_string(),
            b"tag".to_string(),
            b"file_type".to_string(),
            b"blob123".to_string(), 
            &mut world.shared_content,
            b"encrypted_nft".to_string(), 
            ctx(&mut world.scenario),
        );

        // BOB is about to mint the same blob_id
        next_tx(&mut world.scenario, BOB);
        cep::mint_content(
            b"new_title".to_string(), 
            b"description".to_string(),
            b"tag".to_string(),
            b"file_type".to_string(),
            b"blob1234".to_string(), 
            &mut world.shared_content,
            b"encrypted_nft".to_string(), 
            ctx(&mut world.scenario),
        );

        next_tx(&mut world.scenario, OWNER);
        end_world(world);
    }

    #[test]
    public fun test_like_content() {
        let mut world = start_world();
        
        // ALICE is about to mint the content
        next_tx(&mut world.scenario, ALICE); 

        cep::mint_content(
            b"new_title".to_string(), 
            b"description".to_string(),
            b"tag".to_string(),
            b"file_type".to_string(),
            b"blob123".to_string(), 
            &mut world.shared_content,
            b"encrypted_nft".to_string(), 
            ctx(&mut world.scenario),
        );

        // Bob is liking above content
        next_tx(&mut world.scenario, BOB);

        cep::like_content(
            b"blob123".to_string(),
            &mut world.shared_content,
            ctx(&mut world.scenario),
        );

        assert_eq(cep::get_like(&world.shared_content, b"blob123".to_string()), 1);

        next_tx(&mut world.scenario, OWNER);
        end_world(world);
    }


    #[test, expected_failure(abort_code=content_monitize::cep::EUserAlreadyLikedPost)]
    public fun test_liking_multiple_time_with_same_user() {
        let mut world = start_world();
        
        // ALICE is about to mint the content
        next_tx(&mut world.scenario, ALICE); 

        cep::mint_content(
            b"new_title".to_string(), 
            b"description".to_string(),
            b"tag".to_string(),
            b"file_type".to_string(),
            b"blob123".to_string(), 
            &mut world.shared_content,
            b"encrypted_nft".to_string(), 
            ctx(&mut world.scenario),
        );

        // Bob is liking above content
        next_tx(&mut world.scenario, BOB);

        cep::like_content(
            b"blob123".to_string(),
            &mut world.shared_content,
            ctx(&mut world.scenario),
        );

        // Bob is liking above content
        next_tx(&mut world.scenario, BOB);

        cep::like_content(
            b"blob123".to_string(),
            &mut world.shared_content,
            ctx(&mut world.scenario),
        );
        

        next_tx(&mut world.scenario, OWNER);
        end_world(world);
    }

    #[test]
    public fun test_liking_multiple_time_with_different_user() {
        let mut world = start_world();
        
        // ALICE is about to mint the content
        next_tx(&mut world.scenario, ALICE); 

        cep::mint_content(
            b"new_title".to_string(), 
            b"description".to_string(),
            b"tag".to_string(),
            b"file_type".to_string(),
            b"blob123".to_string(), 
            &mut world.shared_content,
            b"encrypted_nft".to_string(), 
            ctx(&mut world.scenario),
        );

        // Bob is liking above content
        next_tx(&mut world.scenario, BOB);

        cep::like_content(
            b"blob123".to_string(),
            &mut world.shared_content,
            ctx(&mut world.scenario),
        );

        // Bob is liking above content
        next_tx(&mut world.scenario, JOE);

        cep::like_content(
            b"blob123".to_string(),
            &mut world.shared_content,
            ctx(&mut world.scenario),
        );
        
        assert_eq(cep::get_like(&world.shared_content, b"blob123".to_string()), 2);

        next_tx(&mut world.scenario, OWNER);
        end_world(world);
    }

    #[test]
    public fun test_get_register_content() {
        let mut world = start_world();
        let content_id;
        // ALICE is about to mint the content
        next_tx(&mut world.scenario, ALICE); 

        cep::mint_content(
            b"new_title".to_string(), 
            b"description".to_string(),
            b"tag".to_string(),
            b"file_type".to_string(),
            b"blob123".to_string(), 
            &mut world.shared_content,
            b"encrypted_nft".to_string(), 
            ctx(&mut world.scenario),
        );

        next_tx(&mut world.scenario, ALICE); 

        let content = ts::take_from_sender<Content>(&world.scenario);
        content_id = object::id_to_address(&object::id(&content));

        let register_content = cep::get_registered_content(&world.shared_content);
        ts::return_to_sender<Content>(&world.scenario, content);
        debug::print(&register_content);
        assert_eq(register_content.contains(&content_id), true);

        next_tx(&mut world.scenario, OWNER);
        end_world(world);
    }

    #[test]
    public fun test_get_total_accrued_points() {
        let mut world = start_world();
        
        next_tx(&mut world.scenario, ALICE); 

        cep::mint_content(
            b"new_title".to_string(), 
            b"description".to_string(),
            b"tag".to_string(),
            b"file_type".to_string(),
            b"blob123".to_string(), 
            &mut world.shared_content,
            b"encrypted_nft".to_string(), 
            ctx(&mut world.scenario),
        );

        // next_tx(&mut world.scenario, BOB);

        // cep::like_content(
        //     b"blob123".to_string(),
        //     &mut world.shared_content,
        //     ctx(&mut world.scenario),
        // );

        next_tx(&mut world.scenario, OWNER);

        cep::content_incentivized(
            &world.admin_cap, 
            b"blob123".to_string(),
            &mut world.shared_content,
        );

        next_tx(&mut world.scenario, OWNER);

        let total_accrued_points = cep::get_total_accrued_points(&world.shared_content, ALICE);
        assert_eq(total_accrued_points, 1);

        next_tx(&mut world.scenario, OWNER);
        end_world(world);
    }
    
    #[test]
    public fun test_check_points() {
        let mut world = start_world();
        
        next_tx(&mut world.scenario, ALICE); 

        cep::mint_content(
            b"new_title".to_string(), 
            b"description".to_string(),
            b"tag".to_string(),
            b"file_type".to_string(),
            b"blob123".to_string(), 
            &mut world.shared_content,
            b"encrypted_nft".to_string(), 
            ctx(&mut world.scenario),
        );

        // next_tx(&mut world.scenario, BOB);

        // cep::like_content(
        //     b"blob123".to_string(),
        //     &mut world.shared_content,
        //     ctx(&mut world.scenario),
        // );

        next_tx(&mut world.scenario, BOB);

        let flag: bool = cep::check_content_like(
            &world.shared_content, 
            b"blob123".to_string(),
            BOB
        );

        assert_eq(flag, false);
        debug::print(&flag);
  

        next_tx(&mut world.scenario, OWNER);

        cep::content_incentivized(
            &world.admin_cap, 
            b"blob123".to_string(),
            &mut world.shared_content,
        );

        next_tx(&mut world.scenario, OWNER);

        let total_accrued_points = cep::get_total_accrued_points(&world.shared_content, ALICE);

        next_tx(&mut world.scenario, OWNER);
        end_world(world);
    }
}