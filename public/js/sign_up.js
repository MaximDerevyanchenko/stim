const SignUp = {
    data: function() {
        return {
            account: {
                'username': "",
                'password': "",
                'email': "",
                'nickname': "",
                'state': "offline",
                'avatarImg': "",
                'backgroundImg': "",
                'bio': "",
                'name': "",
                'countryName': "Italy",
                'countryCode': 'IT',
                'lastOnline': null
            },
            typePassword: "password",
            typeConfirmPassword: "password",
            confirmPassword: "",
            countries: [],
            avatarPreview: null,
            backgroundPreview: null,
            day: 24*60*60
        }
    },
    template: `
<div class="d-flex justify-content-center">
    <form ref="form" class="needs-validation bg-secondary border border-light border-2 shadow-lg container-sm rounded mt-4 p-4" novalidate>
        <h4 class="display-4 text-center mb-4">Sign Up</h4>
        <div class="row row-cols-1 row-cols-lg-2 gy-4 mb-4">
            <div class="col">
                <div class="form-floating">
                    <input class="form-control bg-transparent text-white" placeholder="username" id="usernameSignUp" v-model="account.username" type="text" required autocomplete="on"/>
                    <label for="usernameSignUp">Username<span class="text-danger fw-bold ms-2">*</span></label>
                    <div class="invalid-feedback">This username is not available.</div>
                </div>
            </div>
             <div class="col">
                <div class="form-floating">
                    <input class="form-control bg-transparent text-white" placeholder="email@gmail.com" id="email" v-model="account.email" type="email" required autocomplete="on"/>
                    <label for="email">Email<span class="text-danger fw-bold ms-2">*</span></label>
                </div>
             </div>
        </div>
        <div class="row row-cols-1 row-cols-lg-3 gy-2 mb-4 justify-content-center">
            <div class="col flex-fill">
                <div class="d-block">
                    <div class="form-floating d-flex">
                        <input class="form-control flex-fill bg-transparent text-white" id="passwordSignUp" placeholder="password" v-model="account.password" minlength="6" v-bind:type="typePassword" required autocomplete="on"/>
                        <label for="passwordSignUp">Password<span class="text-danger fw-bold ms-2">*</span></label>
                        <div class="invalid-tooltip">Password MUST have minimum 6 characters!</div>
                    </div>
                </div>
            </div>
            <div class="col-sm-1 w-auto d-flex p-0 align-self-center">
                <span ref="checkbox" class="far fa-eye align-self-center" @click="showPassword"></span>
            </div>
             <div class="col flex-fill">
                <div class="d-block">
                    <div class="form-floating d-flex">
                        <input class="form-control bg-transparent text-white flex-fill" id="confirmPassword" placeholder="confirmPassword" v-model="confirmPassword" required v-bind:type="typePassword" autocomplete="current-password"/>
                        <label for="confirmPassword">Confirm Password<span class="text-danger fw-bold ms-2">*</span></label>
                    </div>
                </div>
             </div>
        </div>
        <div id="passwords" class="row mb-4 justify-content-center d-none">
            <div class="col-4">
                <div class="invalid-feedback d-block">Passwords are NOT the same.</div>
            </div>
        </div>
        <div class="row row-cols-1 row-cols-lg-2 gy-4 mb-4">
            <div class="col">
                <div class="form-floating">
                    <input class="form-control bg-transparent text-white" placeholder="name" id="name" v-model="account.name" type="text" autocomplete="on"/>
                    <label for="name">Name</label>
                </div>
            </div>
             <div class="col">
                <div class="form-floating">
                    <input class="form-control bg-transparent text-white" placeholder="nickname" id="nickname" v-model="account.nickname" required type="text" />
                    <label for="nickname">Nickname<span class="text-danger fw-bold ms-2">*</span></label>
                </div>
             </div>
        </div>
        <div class="row row-cols-1 row-cols-lg-2 gy-4 mb-4">
            <div class="col">
                <div class="form-floating">
                    <textarea class="form-control bg-transparent text-white" placeholder="Your bio" id="bio" v-model="account.bio" type="text"></textarea>
                    <label for="bio">Biography</label>
                </div>
            </div>
            <div class="col">
                <div class="form-floating">
                    <select class="form-select pb-1 bg-transparent text-white" id="country" v-model="account.countryCode">
                        <option class="bg-primary text-white" v-for="country in countries" :value="country.code">{{ country.name }}</option>
                    </select>
                    <label for="country">Country</label>
                </div>
                <div class="text-center">
                  <img class="w-auto" :src="'https://www.countryflags.io/' + account.countryCode + '/shiny/48.png'" :alt="account.countryName" />
                </div>
            </div>
        </div>
         <div class="row row-cols-2 row-cols-lg-4 gy-2 mb-4">
            <div class="col-11 col-lg-5">
                <label class="input-group-text bg-transparent text-white border-0" for="avatar">Choose your avatar</label>
                <input class="form-control bg-transparent text-white" id="avatar" @change="uploadAvatar" ref="avatarPreview" type="file" accept="image/*"/>
            </div>
            <div class="col-1 col-lg-1 align-self-end">
                <span class="fas fa-trash mb-2" role="button" @click="removeAvatar"></span>
            </div>
            <div class="col-11 col-lg-5">
                <label class="input-group-text bg-transparent text-white border-0" for="background">Choose your background</label>
                <input class="form-control bg-transparent text-white" id="background" @change="uploadBackground" ref="backgroundPreview" type="file" accept="image/*" />
            </div>
            <div class="col-1 col-lg-1 align-self-end">
                <span class="fas fa-trash mb-2" role="button" @click="removeBackground"></span>
            </div>
        </div>
        <div class="row row-cols-1 row-cols-lg-2 gy-2" :class="!avatarPreview && backgroundPreview ? 'flex-row-reverse' : ''" v-if="avatarPreview || backgroundPreview">
            <div class="col" v-if="avatarPreview">
                <img class="img-thumbnail" :src="avatarPreview" :alt="account.avatarImg.name"/>
            </div>
            <div class="col" v-if="backgroundPreview">
                <img class="img-thumbnail" :src="backgroundPreview" :alt="account.backgroundImg.name"/>
            </div>
        </div>
        <div class="d-md-flex justify-content-between mt-4">
            <div class="ms-2 col-12 col-md-6">
                <em>All fields with <span class="text-danger">*</span> are required.</em>
            </div>
            <div class="d-flex mt-2 justify-content-center">
            <button @click.prevent="signUp" class="btn btn-outline-light" role="button" type="submit">Sign Up<i class="fas fa-pen-fancy ms-2"></i></button>
            </div>
        </div>
    </form>
</div>`,
    methods: {
        signUp: function (e) {
            if (this.isValidated(e)){
                axios.post('http://localhost:3000/api/account/create', this.buildForm())
                    .then(res => {
                        if (!res.data.hasOwnProperty("password")) {
                            const username = document.querySelector('#usernameSignUp')
                            username.classList.remove('is-valid')
                            username.classList.add('is-invalid')
                        } else
                            this.login()
                    })
                    .catch(err => console.log(err))
            }
        },
        isValidated: function (e){
            e.preventDefault()
            let value = true

            const username = document.querySelector('#usernameSignUp')
            if (!username.checkValidity()){
                username.classList.remove('is-valid')
                username.classList.add('is-invalid')
                value = false
            } else {
                username.classList.add('is-valid')
                username.classList.remove('is-invalid')
            }

            const email = document.querySelector('#email')
            if (!email.checkValidity()){
                email.classList.remove('is-valid')
                email.classList.add('is-invalid')
                value = false
            } else {
                email.classList.add('is-valid')
                email.classList.remove('is-invalid')
            }

            const nickname = document.querySelector('#nickname')
            if (!nickname.checkValidity()){
                nickname.classList.remove('is-valid')
                nickname.classList.add('is-invalid')
                value = false
            } else {
                nickname.classList.add('is-valid')
                nickname.classList.remove('is-invalid')
            }

            const password = document.querySelector('#passwordSignUp')
            if (!password.checkValidity()) {
                password.classList.remove('is-valid')
                password.classList.add('is-invalid')
                value = false
            } else {
                password.classList.add('is-valid')
                password.classList.remove('is-invalid')
            }

            const confirmPassword = document.querySelector('#confirmPassword')
            if (!confirmPassword.checkValidity()){
                confirmPassword.classList.remove('is-valid')
                confirmPassword.classList.add('is-invalid')
                value = false
            } else {
                confirmPassword.classList.add('is-valid')
                confirmPassword.classList.remove('is-invalid')
            }

            const passwords = document.querySelector('#passwords')
            if (password.checkValidity() && confirmPassword.checkValidity() && this.account.password !== this.confirmPassword){
                passwords.classList.remove('d-none')
                passwords.classList.add('d-flex')
                confirmPassword.classList.remove('is-invalid')
                confirmPassword.classList.remove('is-valid')
                password.classList.remove('is-invalid')
                password.classList.remove('is-valid')
            } else {
                passwords.classList.add('d-none')
                passwords.classList.remove('d-flex')
            }

            return value
        },
        login: function (){
            axios.post('http://localhost:3000/api/account', this.account)
                .then(response => {
                    this.$cookies.set("username", response.data.username, 7 * this.day)
                    this.$parent.$children[1].$emit('log-event')
                    axios.patch('http://localhost:3000/api/account/' + this.$cookies.get('username') + '/state', { state: "online" })
                        .then(() => this.$router.push({ name: 'Profile', params: { username: this.account.username }}))
                        .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
        },
        uploadAvatar: function (e) {
            this.account.avatarImg = e.target.files[0]
            const reader = new FileReader()
            reader.onload = ev => this.avatarPreview = ev.target.result
            reader.readAsDataURL(this.account.avatarImg)
        },
        uploadBackground: function (e) {
            this.account.backgroundImg = e.target.files[0]
            const reader = new FileReader()
            reader.onload = ev => this.backgroundPreview = ev.target.result
            reader.readAsDataURL(this.account.backgroundImg)
        },
        removeAvatar: function (){
            this.account.avatarImg = ""
            this.$refs.avatarPreview.value = ""
            this.avatarPreview = null
        },
        removeBackground: function (){
            this.account.backgroundImg = ""
            this.$refs.backgroundPreview.value = ""
            this.backgroundPreview = null
        },
        showPassword: function (){
            this.typePassword = this.typePassword === "password" ? "text" : "password"
            this.$refs['checkbox'].classList.toggle('fa-eye-slash')
        },
        getCountries: function () {
            axios.get('http://localhost:3000/api/countries')
                .then(res => this.countries = res.data)
                .catch(err => console.log(err))
        },
        buildForm: function (){
            const form = new FormData()
            form.append('username', this.account.username)
            form.append('password', this.account.password)
            form.append('email', this.account.email)
            form.append('name', this.account.name)
            form.append('nickname', this.account.nickname)
            form.append('bio', this.account.bio)
            form.append('countryCode', this.account.countryCode)
            form.append('countryName', this.account.countryName = this.countries.filter(c => c.code === this.account.countryCode)[0].name)
            form.append('avatarImg', this.account.avatarImg)
            form.append('backgroundImg', this.account.backgroundImg)
            form.append('state', this.account.state)
            form.append('lastOnline', new Date().toLocaleString())
            form.append('isDeveloper', false.toString())
            return form
        }
    },
    mounted() {
        this.getCountries()
    }
}
