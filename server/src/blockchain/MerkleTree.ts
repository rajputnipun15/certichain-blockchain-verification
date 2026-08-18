import crypto from 'crypto';

export interface MerkleProofNode {
  position: 'left' | 'right';
  hash: string;
}

export class MerkleTree {
  public leaves: string[];
  public layers: string[][];

  constructor(hashes: string[]) {
    if (!hashes || hashes.length === 0) {
      this.leaves = [crypto.createHash('sha256').update('EMPTY_MERKLE_TREE').digest('hex')];
    } else {
      this.leaves = hashes.map(h => (h.length === 64 ? h : crypto.createHash('sha256').update(h).digest('hex')));
    }
    this.layers = [this.leaves];
    this.createTree();
  }

  private hashPair(a: string, b: string): string {
    return crypto.createHash('sha256').update(a + b).digest('hex');
  }

  private createTree(): void {
    let currentLayer = this.leaves;
    while (currentLayer.length > 1) {
      const nextLayer: string[] = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          nextLayer.push(this.hashPair(currentLayer[i], currentLayer[i + 1]));
        } else {
          // If odd number of nodes, duplicate last node
          nextLayer.push(this.hashPair(currentLayer[i], currentLayer[i]));
        }
      }
      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }

  public getRoot(): string {
    return this.layers[this.layers.length - 1][0];
  }

  public getProof(leafHash: string): MerkleProofNode[] {
    const targetHash = leafHash.length === 64 ? leafHash : crypto.createHash('sha256').update(leafHash).digest('hex');
    let index = this.leaves.indexOf(targetHash);
    if (index === -1) return [];

    const proof: MerkleProofNode[] = [];
    for (let layerIndex = 0; layerIndex < this.layers.length - 1; layerIndex++) {
      const currentLayer = this.layers[layerIndex];
      const isRightNode = index % 2 === 1;
      const pairIndex = isRightNode ? index - 1 : index + 1;

      if (pairIndex < currentLayer.length) {
        proof.push({
          position: isRightNode ? 'left' : 'right',
          hash: currentLayer[pairIndex],
        });
      } else {
        // Duplicated right node case
        proof.push({
          position: 'right',
          hash: currentLayer[index],
        });
      }
      index = Math.floor(index / 2);
    }
    return proof;
  }

  public static verifyProof(leafHash: string, proof: MerkleProofNode[], rootHash: string): boolean {
    let currentHash = leafHash.length === 64 ? leafHash : crypto.createHash('sha256').update(leafHash).digest('hex');
    for (const node of proof) {
      if (node.position === 'left') {
        currentHash = crypto.createHash('sha256').update(node.hash + currentHash).digest('hex');
      } else {
        currentHash = crypto.createHash('sha256').update(currentHash + node.hash).digest('hex');
      }
    }
    return currentHash === rootHash;
  }
}
