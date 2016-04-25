/**
 *
 */

'use strict';

import Physics from '../physics';
import UserInput from '../ui/input';
import UserOutput from '../ui/output';
import AI from '../ai';
import ObjectManager from '../objects';

class Flat3Factory {

    static createPhysics() {
        return new Physics();
    }

    static createUserInput() {
        return new UserInput();
    }

    static createUserOutput(game, playerman) {
        return new UserOutput(game, playerman);
    }

    static createAI() {
        return new AI();
    }

    static createObjectManager() {
        return new ObjectManager();
    }

}

export default Flat3Factory;