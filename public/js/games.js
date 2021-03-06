const Games = {
    data: function () {
        return {
            games: [],
            progress: 0,
            currentActive: 0
        }
    },
    template: `
        <div class="bg-primary d-flex justify-content-center">
            <div id="progress" class="d-flex justify-content-center align-items-center text-white mt-5">
                <strong class="fs-4 me-4 align-middle">Loading...</strong>
                <div class="spinner-grow ms-4" role="status" aria-hidden="true"></div>
            </div>
            <div v-if="progress === 100" id="carousel" ref="carousel" class="carousel slide carousel-fade mt-5 d-flex justify-content-center col-12 col-md-9 col-xxl-6" data-bs-ride="carousel">
                <button class="carousel-control" type="button" data-bs-target="#carousel" role="button" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <div class="carousel-indicators">
                    <button v-for="(game, index) in games" ref="indicators" role="button" type="button" :class="index === 0 ? 'active' : ''" :aria-current="index === 0 ? 'true' : ''" data-bs-target="#carousel" :data-bs-slide-to="index" :aria-label="game.name"></button>
                </div>
                <div class="carousel-inner bg-dark">
                    <div class="carousel-item p-1" @click="goToGame(game)" role="button" data-bs-interval="3000" v-for="(game,index) in games" ref="items" :class="index === 0 ? 'active' : ''">
                        <div class="w-100 h-100 position-absolute top-50 start-50 translate-middle" id="backgroundImg" :style="'background: url(' + game.background + ')'"></div>
                         <div class="d-block d-lg-flex justify-content-center">
                            <img :src="game.header_image" class="d-inline col-12 col-lg-8 ps-lg-3" :alt="game.name" /> 
                            <div class="m-3 col-12 col-lg-4 d-flex flex-column justify-content-between">
                                <h4>{{ game.name }}</h4>
                                <small v-if="game.is_free" class="text-muted mt-5">Free to play</small>
                                <small v-else-if="game.price_overview" class="text-muted mt-5">Current price: {{game.price_overview.final_formatted}}</small>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="carousel-control" type="button" role="button" data-bs-target="#carousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                </button>
            </div>
        </div>
    `,
    methods: {
        getGames: function () {
            axios.get("http://localhost:3000/api/games")
                .then(response => {
                    let promises = []
                    response.data.forEach(game => {
                        if (game.isLocal)
                            promises.push(axios.get("http://localhost:3000/api/games/" + game.gameId + "/local")
                                    .then(g => g)
                                    .catch(err => console.log(err)))
                        else
                            promises.push(axios.get("http://localhost:3000/api/games/" + game.gameId + "/steam")
                                .then(g => g)
                                .catch(err => console.log(err)))
                    })
                    Promise.all(promises)
                        .then(res => {
                            res.filter(r => r.status === 200).forEach(game => this.games.push(game.data))
                            this.progress = 99
                            setTimeout(() => {
                                this.progress = 100
                                if (document.querySelector('#progress') != null)
                                    document.querySelector('#progress').classList.add('invisible', 'd-none')
                            }, 1200)
                        })
                        .catch(err => console.log(err))
                })
                .catch(error => console.log(error))
        },
        goToGame: function (game) {
            this.$router.push({ name: 'Game', params: { gameId: game.gameId}})
        }
    },
    mounted() {
        this.getGames()
    }
}
