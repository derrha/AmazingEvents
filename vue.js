function Menu(e){
    let list = document.querySelector("ul");

    e.name === "menu" ? (e.name = "close", list.classList.add("top-[80px]"), list.classList.add("opacity-100"), list.classList.add("z-10")) : (e.name = "menu" , list.classList.remove("top-[80px]"), list.classList.remove("opacity-100"), list.classList.remove("z-10"))
}

const { createApp } = Vue
createApp({
	data() {
		return {
            events: [],
            details: {},
			statsEvents: [],
			statsUpcoming : [],
			statsPast : [],
			filteredEvents : [],
			date: "",
			allCategories: [],
			categories: [],
			upcoming:[],
			past:[],
			inputSearch : "",
			checkedCategories : [],
			moneyFormat : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
            numberFormat : new Intl.NumberFormat('en-US'),
            percentageFormat : new Intl.NumberFormat('default', { style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 1,}),
		}
	},
	created() {
		// this.personajes.push('Personaje1', 'personaje2')
		fetch('https://amazing-events.herokuapp.com/api/events')
			.then((response) => response.json())
			.then((json) => {
                
                this.date = json.currentDate

                if(document.title == "Home | Amazing Events"){
                    this.events = json.events
                }
                else if(document.title == "Upcoming Events | Amazing Events"){
                    this.events = json.events.filter(event => event.date > this.date)
                    
                }
                else if(document.title == "Past Events | Amazing Events"){
                    this.events = json.events.filter(event => event.date < this.date)
                }else{
                    this.events = json.events
                }

				this.filteredEvents = this.events
				this.allCategories = json.events.map(event => event.category)
				this.categories = new Set (this.allCategories)
				this.upcoming = this.events.filter(event => event.date > this.date)
				this.past = this.events.filter(event => event.date < this.date)
				this.statsEvents = this.capacityAttendance(this.events)
				this.statsUpcoming = this.revenueAndAttendance(this.upcoming)
				this.statsPast = this.revenueAndAttendance(this.past)
                const queryString = location.search
                const params = new URLSearchParams(queryString)
                const cardId = params.get("id")
                this.details = this.events.find(event => event._id === cardId)
			})

			.catch((error) => console.log(error))
	},
	mounted() {},
	methods: {
		searchFilter(arrEvents){
			this.events = arrEvents.filter(event => event.name.toLowerCase().includes(this.inputSearch.toLowerCase()))
		},
        capacityAttendance(arrayData){
            let arrFiltered = arrayData.filter(events => events.assistance != undefined)
            let capacityEvent = arrayData.map(evento => evento.capacity)
            let maxCapacity = Math.max(...capacityEvent)
            let maxCapacityEvent = arrayData.find(evento => evento.capacity == maxCapacity)
        
            let assistanceEvent = arrFiltered.map(evento => (evento.assistance ? evento.assistance : evento.estimate) / evento.capacity)
            let maxAsist = Math.max(...assistanceEvent)
            let maxAsistEvent = arrFiltered.find(evento => ((evento.capacity ? evento.assistance : evento.estimate) / evento.capacity) == maxAsist)
        
            let minAsist = Math.min(...assistanceEvent)
            let minAsistEvent = arrFiltered.find(evento => ((evento.capacity ? evento.assistance : evento.estimate) / evento.capacity) == minAsist)
        
            return [maxAsistEvent, minAsistEvent, maxCapacityEvent]
        },
        revenueAndAttendance(eventsArr){
            let categorys = [];
            eventsArr.forEach(data => {
                if(!categorys.includes(data.category)){
                    categorys.push(data.category)
                }
            })
            let arrayStats = []
            categorys.forEach(category => {
                let filterArr = eventsArr.filter(event => event.category == category)
                let revenues = filterArr.map(event => (event.assistance ?event.assistance :event.estimate) * event.price)
                let assistancePer = filterArr.map(event => (event.assistance ?event.assistance : event.estimate) / event.capacity)
                let totalRevenues = revenues.reduce((act, sig) => act = act + sig, 0)
                let perCategoryAtten = assistancePer.reduce((act, sig) => act = act+ sig, 0)
                arrayStats.push([category, totalRevenues, perCategoryAtten / filterArr.length])
            })
            return arrayStats
        }
	},
	computed: {
        doubleFilter(){
            if(this.checkedCategories.length != 0){
                this.events = this.filteredEvents.filter(event => {
                    return this.checkedCategories.includes(event.category)
                })
            }else{
                this.events = this.filteredEvents
            }
            if(this.inputSearch != ""){
                this.searchFilter(this.events)
            }
        }
	},
}).mount('#app')


