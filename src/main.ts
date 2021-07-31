import './styles/init.sass'
import './styles/tailwind.sass'
import './styles/landing.sass'

const id = (id: string) => document.getElementById(id)
const on = <Event extends keyof HTMLElementEventMap>(
    element: HTMLElement | null,
    event: Event,
    callback: (event: HTMLElementEventMap[Event]) => void
): void => {
    if (element) element.addEventListener(event, callback)
}

const useState = <T extends unknown>(init: T) => {
    let value = init
    let getValue = () => value
    let _callback: (value: T) => void = () => {}

    let onUpdate = (callback: (value: T) => void) => {
        _callback = callback
    }

    let update = (newValue: T) => {
        value = newValue
        _callback(newValue)
    }

    return [getValue, update, onUpdate] as const
}

const main = () => {
    let previous = id('previous')!
    let next = id('next')!
    let progressBar = id('progress-bar')!
    let progress = id('progress')!

    let [getIndex, updateIndex, onIndexChange] = useState(1)

    let updateFromTimeout = false

    let updateBatchTimeout = () => {
        updateFromTimeout = true
        updateIndex(getIndex() + 1)

        requestClearInterval()
        setTimeout(() => {
            batchInterval = setInterval(updateBatchTimeout, 8000)
        }, 500)
    }

    let batchInterval = setInterval(updateBatchTimeout, 8000)

    let requestClearInterval = () => {
        clearInterval(batchInterval)
    }

    let requestBatchChange = (requestChange: () => void) => {
        updateFromTimeout = false
        clearInterval(batchInterval)
        batchInterval = setInterval(updateBatchTimeout, 8000)
        requestChange()
    }

    on(previous, 'click', () =>
        requestBatchChange(() => {
            updateIndex(getIndex() - 1)
        })
    )

    on(next, 'click', () =>
        requestBatchChange(() => {
            updateIndex(getIndex() + 1)
        })
    )

    onIndexChange((newIndex) => {
        if (!updateFromTimeout) {
            progressBar.classList.remove('--animation')
            progress.classList.remove('--animation')

            requestAnimationFrame(() => {
                progressBar.classList.add('--animation')
                progress.classList.add('--animation')
            })
        }

        if (newIndex < 1) return updateIndex(5)
        if (newIndex > 5) return updateIndex(1)

        let lastActive = document.querySelector('.batch.--active')
        lastActive?.classList.remove('--active')
        lastActive?.classList.add('--fading-out')

        setTimeout(() => {
            lastActive?.classList.remove('--fading-out')
        }, 720 + 16)

        let active = id(`batch-${newIndex}`)!

        active.classList.add('--active')
    })
}

document.addEventListener('DOMContentLoaded', main, {
    passive: true,
    once: true
})
