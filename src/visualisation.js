/**
 Javascript to handle the visualisation using Sigma.js
 A transaction is split across 2 Nodes and an Edge.
 @author Lucas Bruck
 **/


/**
 * Graphnode
 * @param{id}: Integer. The sending node ID
 * @param{value}: Float. The value of the transaction
 */
class GraphNode {
    constructor(id, value) {
        this.id = id;
        this.value = value;

        this.position = new Point();
    }
}

/**
 * Point
 * The position on the screen of the transaction
 */
class Point {
    constructor() {
        // might not be great logic, but follows guidance from Sigma.js
        this.x = Math.random();
        this.y = Math.random();
    }
}

/**
 * Undirected edge between two transactions. Yes IRL they are directed, but not in a visualisation regard
 * @param{source}: String. The ID of the sending node.
 */
class Edge {
    constructor (source, destination, weight, id) {
        this.source = source;
        this.destination = destination;
        this.weight = weight;
        this.id = id;
    }
}