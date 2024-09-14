// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

module content_monitize::private_content {
    use sui::bls12381;
    use sui::hash::blake2b256;
    use sui::group_ops::{Self, Element};
    use sui::vec_set::{Self, VecSet};
    use std::string::String;

    // const EProveError: u64 = 1;

    public struct Config has key {
        id: UID,
        nft_ids: VecSet<ID>
    }

    public struct EncryptedContent has key, store {
        id: UID,
        name: String,
        image_url: String,
        ciphertext_url: String,
        encrypted_master_key: ElGamalEncryption,
        public_key: address,
    }

    public struct EqualityProof has drop, store {
        s1: Element<bls12381::Scalar>, // z1
        s2: Element<bls12381::Scalar>, // z2
        u1: Element<bls12381::G1>, // a1
        u2: Element<bls12381::G1>, // a2
        v: Element<bls12381::G1>, // a3
    }

    // An encryption of group element m under pk is (r*G, r*pk + m) for random r.
    public struct ElGamalEncryption has drop, copy, store {
        ephemeral: Element<bls12381::G1>,
        ciphertext: Element<bls12381::G1>,
    }

    fun init(ctx:&mut TxContext){
        transfer::share_object(Config{
            id: object::new(ctx),
            nft_ids: vec_set::empty()
        })
    }

    public fun new(
        name: String,
        image_url: String,
        ciphertext_url: String,
        ephemeral_v: vector<u8>,
        ciphertext_v: vector<u8>,
        config: &mut Config,
        ctx: &mut TxContext
        ): EncryptedContent 
    {
        let ephemeral = bls12381::g1_from_bytes(&ephemeral_v);
        let ciphertext = bls12381::g1_from_bytes(&ciphertext_v);
       
        let nft = EncryptedContent {
            id: object::new(ctx),
            name,
            image_url,
            ciphertext_url,
            encrypted_master_key: ElGamalEncryption {
                ephemeral,
                ciphertext,
            },
            public_key: tx_context::sender(ctx)
        };
        vec_set::insert(&mut config.nft_ids, object::id(&nft));
        nft
    }
    
    fun equality_verify(
        pk1: &Element<bls12381::G1>, // seller 
        pk2: &Element<bls12381::G1>, // buyer
        enc1: &ElGamalEncryption, // prev encryption
        enc2: &ElGamalEncryption, // curr encryption
        proof: &EqualityProof
    ): bool {
        let c = fiat_shamir_challenge(pk1, pk2, enc1, enc2, &proof.u1, &proof.u2, &proof.v);
        // Check if z1*G = a1 + c*pk1
        let lhs = bls12381::g1_mul(&proof.s1, &bls12381::g1_generator());
        let pk1_c = bls12381::g1_mul(&c, pk1);
        let rhs = bls12381::g1_add(&proof.u1, &pk1_c);
        if (!group_ops::equal(&lhs, &rhs)) {
            return false
        };
        // Check if z2*G = a2 + c*eph2
        let lhs = bls12381::g1_mul(&proof.s2, &bls12381::g1_generator());
        let eph2_c = bls12381::g1_mul(&c, &enc2.ephemeral);
        let rhs = bls12381::g1_add(&proof.u2, &eph2_c);
        if (!group_ops::equal(&lhs, &rhs)) {
            return false
        };
        //if prev_enc_msk.ephemeral * proof.s1 - buyer_enc_pk * proof.s2
        // != (prev_enc_msk.ciphertext - curr_enc_msk.ciphertext) * c + proof.v
        
        // Check if a3 = c*(ct2 - ct1) + z1*eph1 - z2*pk2
        let mut lhs1 = bls12381::g1_identity();
        lhs1 = bls12381::g1_add(&lhs1, &bls12381::g1_mul(&c, &enc2.ciphertext));
        lhs1 = bls12381::g1_add(&lhs1, &bls12381::g1_mul(&bls12381::scalar_neg(&c), &enc1.ciphertext));
        lhs1 = bls12381::g1_add(&lhs1, &bls12381::g1_mul(&proof.s1, &enc1.ephemeral));
        lhs1 = bls12381::g1_add(&lhs1, &bls12381::g1_mul(&bls12381::scalar_neg(&proof.s2), pk2));
        if (!group_ops::equal(&lhs1, &proof.v)) {
            return false
        };
        return true
    }

    fun fiat_shamir_challenge(
        pk1: &Element<bls12381::G1>,
        pk2: &Element<bls12381::G1>,
        enc1: &ElGamalEncryption,
        enc2: &ElGamalEncryption,
        a1: &Element<bls12381::G1>,
        a2: &Element<bls12381::G1>,
        a3: &Element<bls12381::G1>,
    ): Element<bls12381::Scalar> {
        let mut to_hash = vector::empty<u8>();
        vector::append(&mut to_hash, *group_ops::bytes(pk1));
        vector::append(&mut to_hash, *group_ops::bytes(pk2));
        vector::append(&mut to_hash, *group_ops::bytes(&enc1.ephemeral));
        vector::append(&mut to_hash, *group_ops::bytes(&enc1.ciphertext));
        vector::append(&mut to_hash, *group_ops::bytes(&enc2.ephemeral));
        vector::append(&mut to_hash, *group_ops::bytes(&enc2.ciphertext));
        vector::append(&mut to_hash, *group_ops::bytes(a1));
        vector::append(&mut to_hash, *group_ops::bytes(a2));
        vector::append(&mut to_hash, *group_ops::bytes(a3));
        let mut hash = blake2b256(&to_hash);

        // Make sure we are in the right field. Note that for security we only need the lower 128 bits.
        // let len = vector::length(&hash);
        *vector::borrow_mut(&mut hash, 0) = 0;
        bls12381::scalar_from_bytes(&hash)
    }

    #[test_only]
    /// Wrapper of module initializer for testing   
    public fun test_init(ctx: &mut TxContext) { 
        init(ctx)
    } 
}