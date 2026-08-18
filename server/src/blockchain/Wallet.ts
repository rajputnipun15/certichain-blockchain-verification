import crypto from 'crypto';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export class Wallet {
  public static generateKeyPair(): KeyPair {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    return { publicKey, privateKey };
  }

  public static sign(privateKeyPem: string, data: string): string {
    try {
      const buffer = Buffer.from(data);
      const signature = crypto.sign(null, buffer, privateKeyPem);
      return signature.toString('hex');
    } catch (err) {
      console.error('Signing error:', err);
      throw new Error('Failed to create digital signature');
    }
  }

  public static verify(publicKeyPem: string, data: string, signatureHex: string): boolean {
    try {
      const buffer = Buffer.from(data);
      const signature = Buffer.from(signatureHex, 'hex');
      return crypto.verify(null, buffer, publicKeyPem, signature);
    } catch (err) {
      console.error('Verification error:', err);
      return false;
    }
  }
}
