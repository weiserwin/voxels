/**
 *
 */

'use strict';

import ChunkGenerator from './chunkgenerator';

class WorldGenerator {

    static generateFlatWorld(chunkSizeX, chunkSizeY, chunkSizeZ, worldManager) {
        return {
            '0,0':      WorldGenerator.generateFlatChunk(chunkSizeX, chunkSizeY, chunkSizeZ, 0, 0, worldManager)/*,
            '-1,0':      WorldGenerator.generateFlatChunk(chunkSizeX, chunkSizeY, chunkSizeZ, -1, 0, worldManager),
            '0,-1':      WorldGenerator.generateFlatChunk(chunkSizeX, chunkSizeY, chunkSizeZ, 0, -1, worldManager),
            '0,1':      WorldGenerator.generateFlatChunk(chunkSizeX, chunkSizeY, chunkSizeZ, 0, 1, worldManager),
            '1,0':      WorldGenerator.generateFlatChunk(chunkSizeX, chunkSizeY, chunkSizeZ, 1, 0, worldManager)*/
        };
    }

    static generateFlatChunk(x, y, z, i, j, worldManager) {
        let id = i+','+j;
        return ChunkGenerator.createRawChunk(x, y, z, id, worldManager);
    }

    static generatePerlinWorld() {
        return {};
    }

}

export default WorldGenerator;
