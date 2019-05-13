
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
