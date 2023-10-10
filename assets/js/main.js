document.addEventListener('DOMContentLoaded', async () => {
    const url = 'https://leadshop.club/api/payment/getTariffs'

    let data = null

    const fetchData = async () => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    for_landing: true
                })
            })

            if (!response.ok) {
                throw new Error('Network response was not ok')
            }

            data = await response.json()

            console.log(data)
        } catch (error) {
            console.error(error.message)
        }
    }

    await fetchData()

    function groupBy(arr, key) {
        return arr.reduce((rv, x) => {
            (rv[x[key]] = rv[x[key]] || []).push(x)
            return rv
        }, {})
    }

    const groupedTariffs = groupBy(data.tariffs, 'app_category_id')

    const updateServiceAndPrice = (tariff) => {
        const serviceElem = document.querySelector(`.rates__service-name[data-id="${tariff.app_category_id}"]`)
        const priceElem = document.querySelector(`.rates__item-price[data-id="${tariff.app_category_id}"]`)

        if (serviceElem) {
            serviceElem.textContent = tariff.name
        }

        if (priceElem) {
            priceElem.textContent = `${tariff.price}₽`
        }
    }

    Object.keys(groupedTariffs).forEach(key => {
        updateServiceAndPrice(groupedTariffs[key][0])
    })

    const balls = document.querySelectorAll('.ball')
    const sliders = document.querySelectorAll('.slider')

    let isDragging = false

    balls.forEach((ball, index) => {
        const startDrag = (event) => {
            isDragging = true
    
            const clientX = event.touches ? event.touches[0].clientX : event.clientX
            const offsetX = clientX - ball.getBoundingClientRect().left
            const sliderWidth = sliders[index].offsetWidth - ball.offsetWidth
            const sliderFill = sliders[index].querySelector('.slider-fill')
    
            const onMove = (event) => {
                if (!isDragging) return
    
                const clientX = event.touches ? event.touches[0].clientX : event.clientX
                let newLeft = clientX - sliders[index].getBoundingClientRect().left - offsetX
    
                newLeft = Math.min(sliderWidth, newLeft)
                newLeft = Math.max(0, newLeft)
    
                ball.style.left = newLeft + 'px'
                sliderFill.style.width = newLeft + 'px'
    
                const percentage = newLeft / sliderWidth
                const tariffsForSlider = groupedTariffs[index + 1]
                const tariffValue = Math.round(percentage * (tariffsForSlider.length - 1))
    
                updateServiceAndPrice(tariffsForSlider[tariffValue])
            }
    
            document.addEventListener('mousemove', onMove)
            document.addEventListener('touchmove', onMove)
    
            const stopDrag = () => {
                isDragging = false
                document.removeEventListener('mousemove', onMove)
                document.removeEventListener('touchmove', onMove)
            }
    
            document.addEventListener('mouseup', stopDrag, { once: true })
            document.addEventListener('touchend', stopDrag, { once: true })
        }
    
        ball.addEventListener('mousedown', startDrag)
        ball.addEventListener('touchstart', startDrag)
    })    

    scrollIntoView('.rates-button', '.rates')
    scrollIntoView('.intro__start-button', '.bottom')
})

const scrollIntoView = (item, target) => {
    const button = document.querySelector(item)
    const ratesSection = document.querySelector(target)

    button.addEventListener('click', (event) => {
        event.preventDefault()

        ratesSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
}
