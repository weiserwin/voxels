/**
 *
 */

'use strict';

import ChunkSurfaceExtractor from './chunksurfextractor';
import TopoKernel from './topokernel';

class Chunk {

    constructor(xSize, ySize, zSize, chunkId, worldManager) {
        // App.
        this._worldManager = worldManager;

        // Dimensions, coordinates
        this._xSize = xSize;
        this._ySize = ySize;
        this._zSize = zSize;
        this._capacity = this._xSize * this._ySize * this._zSize;
        this._chunkId = chunkId;
        let ij = chunkId.split(',');
        this._chunkI = parseInt(ij[0]);
        this._chunkJ = parseInt(ij[1]);

        // Blocks.
        /** Flatten array. x, then y, then z. */
        this._blocks = new Uint8Array();
        /** Nested z-array. (each z -> i×j layer, without primary offset) */
        this._surfaceBlocks = {};
        /** Each face -> index of its connected component. */
        this._connectedComponents = new Uint8Array();
        /**  Each connected component -> (sorted) list of face indices. */
        this._fastConnectedComponents = {};
        this._fastConnectedComponentsIds = {}; // Signed.

        // Events.
        this._lastUpdated = process.hrtime();
        this._updates = [{}, {}, {}];

        // Generation.
        this.fillChunk(48, 1);
        this.computeSurfaceBlocksFromScratch();

        // TODO externalize computeConnectedComponents so that a chunk can access its neighbours blocks before
        // any component is computed.
        this.computeConnectedComponents();

        console.log("Computed.");
        // console.log(this._connectedComponents);
        // console.log(this._fastConnectedComponents);
    }

    // Getters
    get chunkI() { return this._chunkI; }
    get chunkJ() { return this._chunkJ; }
    get chunkId() { return this._chunkId; }
    get dimensions() { return [this._xSize, this._ySize, this._zSize]; }
    get capacity() { return this._capacity; }
    get blocks() { return this._blocks; }
    get surfaceBlocks() { return this._surfaceBlocks; }
    get fastComponents() { return this._fastConnectedComponents; }
    get fastComponentsIds() { return this._fastConnectedComponentsIds; }
    get connectedComponents() { return this._connectedComponents; }
    get updates() { return this._updates; }

    // Setters
    set blocks(newBlocks) { this._blocks = newBlocks; }
    set surfaceBlocks(newSurfaceBlocks) { this._surfaceBlocks = newSurfaceBlocks; }
    set fastComponents(newFastComponents) { this._fastConnectedComponents = newFastComponents; }
    set fastComponentsIds(newFastComponentsIds) { this._fastConnectedComponentsIds = newFastComponentsIds; }
    set connectedComponents(newConnectedComponents) { this._connectedComponents = newConnectedComponents; }
    set updates(newUpdates) { this._updates = newUpdates; }

    getNeighboringChunk(direction) {
        let i = this.chunkI;
        let j = this.chunkJ;
        let wm = this._worldManager;

        switch (direction) {
            case 0: // x+
                return wm.getChunk(i+1, j);
            case 1: // x-
                return wm.getChunk(i-1, j);
            case 2: // y+
                return wm.getChunk(i, j+1);
            case 3: // y-
                return wm.getChunk(i, j-1);
            case 4: // z+ (to be implemented in non-flat models)
            case 5: // z- (idem)
                return null;
            default:
        }
    }

    isNeighboringChunkLoaded(direction) {
        let i = this.chunkI;
        let j = this.chunkJ;
        let wm = this._worldManager;

        switch (direction) {
            case 0: // x+
                return wm.isChunkLoaded(i+1, j);
            case 1: // x-
                return wm.isChunkLoaded(i-1, j);
            case 2: // y+
                return wm.isChunkLoaded(i, j+1);
            case 3: // y-
                return wm.isChunkLoaded(i, j-1);
            case 4: // z+
            case 5: // z-
                return false;
            default:
        }
    }

    /**
     * Detect boundary blocks.
     */
    computeSurfaceBlocksFromScratch() {
        console.log('\tExtracting surface...');
        var extractor = new ChunkSurfaceExtractor(this);
        extractor.extractSurfaceBlocks();
        // TODO optimize during generation.
    }

    /**
     * Detect connected boundary face components.
     */
    computeConnectedComponents() {
        console.log("\tComputing connected components...");
        var extractor = new ChunkSurfaceExtractor(this);
        extractor.extractConnectedComponents();
    }

    // Set all cubes until a given height to a given id.
    fillChunk(toZ, blockId) {
        if (typeof toZ !== "number") return;
        if (typeof blockId !== "number") return;
        console.log('Generating chunk...');

        const numberOfBlocksToFill = this._xSize * this._ySize * toZ;
        const numberOfBlocks = this._capacity;

        let blocks = new Uint8Array(numberOfBlocks);
        blocks.fill(blockId, 0, numberOfBlocksToFill);
        blocks.fill(0, numberOfBlocksToFill, numberOfBlocks);

        /*
        let numberAdded = 0;
        for (let i = numberOfBlocksToFill; i<numberOfBlocksToFill+this._xSize*this._ySize; ++i) {
            if (Math.random() > 0.5) {
                blocks[i] = blockId;
                numberAdded++;
            }
        }
        console.log(numberAdded + " different block(s) added.");
        */

        this._blocks = blocks;

        console.log("\t" + this._blocks.length + " blocks generated.");
    }

    _toId(x, y, z) {
        var id = x + y * this._xSize + z * this._xSize * this._ySize;
        if (id >= this._capacity) console.log("chunk._toId: invalid request coordinates.");
        return id;
    }

    what(x, y, z) {
        var id = this._toId(x, y, z);
        if ((id >= this._capacity) || (id < 0)) return 0;
        return this._blocks[id];
    }

    contains(x, y, z) {
        return this.what(x, y, z) !== 0;
    }

    add(x, y, z, blockId) {
        var id = this._toId(x, y, z);
        if (id >= this._capacity) return;

        this._blocks[id] = blockId; // Update blocks.
        TopoKernel.updateSurfaceBlocksAfterAddition(this, id, x, y, z); // Update surface blocks.

        // TODO Update connected components.
        TopoKernel.updateSurfaceFacesAfterAddition(this, id, x, y, z);
    }

    del(x, y, z) {
        var id = this._toId(x, y, z);
        if (id >= this._capacity) return;

        this._blocks[id] = 0;
        TopoKernel.updateSurfaceBlocksAfterDeletion(this, id, x, y, z);

        // TODO update connected components
        TopoKernel.updateSurfaceFacesAfterDeletion(this, id, x, y, z);
    }

    flushUpdates() {
        this._updates = [{}, {}, {}];
    }
}

export default Chunk;
