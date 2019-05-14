
/**
 * Wowee this is dumb pub/sub stream. Technically could be classified as a 'hot stream' I think.
 * Events aren't cached or replayed to new subscribers, and subscribers can't unsubscribe.
 *
 * TODO should really be using rxjs https://rxjs.dev/
 */
export default function SimpleStream() {
    const subscribers = []

    return {
        sub(f) {
            subscribers.push(f)
        },

        pub(message) {
            subscribers.forEach(subscriber => {
                subscriber(message)
            })
        },
    }
}


/**
 * Just a wrapper for incrementally pulling results from an array.
 * Should be able to update this to be more simple & more mem efficient.
 */
export function IterStream(elements) {
    const generator = function*() {
        for (const elem of elements) {
            yield elem
        }
    }();

    return {
        take(n) {
            let elements = []
            for (let i = 0; i < n; i++) {
                let next = generator.next()
                if (next.done) {
                    break
                } else {
                    elements.push(next.value)
                }
            }
            return elements
        },

        drain() {
            let elements = []
            for (const elem of generator) {
                elements.push(elem)
            }
            return elements
        },

        isDone() {
            return generator.next().done === true
        },

        size() {
            return elements.length
        }
    }
}