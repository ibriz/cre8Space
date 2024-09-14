export function u256ToBlobId(u256Value: string): string {
  console.log(u256Value, typeof u256Value);
  // Step 1: Convert the u256 to little-endian hexadecimal
  const hexValue = BigInt(u256Value)
    .toString(16)
    .padStart(64, "0")
    .match(/.{2}/g)!
    .reverse()
    .join("");

  // Step 2: Convert the hex to bytes
  const hexBytes = new Uint8Array(
    hexValue.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)),
  );

  // Step 3: Convert the bytes to URL-safe base64 with no padding
  const base64 = btoa(String.fromCharCode(...hexBytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return base64;
}
