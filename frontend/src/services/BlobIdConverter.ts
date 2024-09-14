export function blobIdToU256(blobId: string): string {
  // Step 1: Add padding if necessary
  const padding = "=".repeat((4 - (blobId.length % 4)) % 4);
  const paddedBlobId = blobId + padding;

  // Step 2: Decode the base64 string back to bytes
  const hexBytes = Uint8Array.from(
    atob(paddedBlobId.replace(/-/g, "+").replace(/_/g, "/")),
    (c) => c.charCodeAt(0),
  );

  // Step 3: Convert the bytes to a U256 value (little-endian order)
  let u256Value = BigInt(0);
  for (let i = 0; i < hexBytes.length; i++) {
    u256Value += BigInt(hexBytes[i]) << BigInt(8 * i);
  }

  return u256Value.toString();
}
