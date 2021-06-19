const SignUp = {
    data: function() {
        return {
            exists: false,
            existingId: "",
            account: {
                'username': "",
                'password': "",
                'email': "",
                'nickname': "",
                'state': "offline"
            },
            typePassword: "password",
            typeConfirmPassword: "password",
            confirmPassword: "",
            countries: [],
            avatarPreview: null,
            backgroundPreview: null
        }
    },
    template: `
<div class="d-flex justify-content-center">
    <form ref="form" class="needs-validation border border-dark border-2 shadow-lg rounded w-50 mt-4 p-4" novalidate>
        <div class="row mb-4">
            <div class="col">
                <div class="form-floating">
                    <input class="form-control" placeholder="username" id="usernameSignUp" v-model="account.username" type="text" @change="hideExists" required autocomplete="on"/>
                    <label for="usernameSignUp">Username<span class="text-danger fw-bold ms-2">*</span></label>
                </div>
            </div>
             <div class="col">
                <div class="form-floating">
                    <input class="form-control" placeholder="email@gmail.com" id="email" v-model="account.email" type="email" required/>
                    <label for="email">Email<span class="text-danger fw-bold ms-2">*</span></label>
                </div>
             </div>
        </div>
        <div class="row mb-4">
            <div class="col pe-1">
                <div class="d-block">
                    <div class="form-floating d-flex">
                        <input class="form-control flex-fill" id="passwordSignUp" placeholder="password" v-model="account.password" minlength="6" v-bind:type="typePassword" required autocomplete="on"/>
                        <label for="passwordSignUp">Password<span class="text-danger fw-bold ms-2">*</span></label>
                        <div class="invalid-tooltip">Password MUST have minimum 6 characters!</div>
                    </div>
                </div>
            </div>
            <div class="col-auto d-flex ps-1 pe-1">
                <span ref="checkbox" class="far fa-eye align-self-center" @click="showPassword"></span>
            </div>
             <div class="col ps-1">
                <div class="d-block">
                    <div class="form-floating d-flex">
                        <input class="form-control flex-fill" id="confirmPassword" placeholder="confirmPassword" v-model="confirmPassword" required v-bind:type="typePassword" autocomplete="current-password"/>
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
        <div class="row mb-4">
            <div class="col">
                <div class="form-floating">
                    <input class="form-control" placeholder="name" id="name" v-model="account.name" type="text" autocomplete="on"/>
                    <label for="name">Your name</label>
                </div>
            </div>
             <div class="col">
                <div class="form-floating">
                    <input class="form-control" placeholder="nickname" id="nickname" v-model="account.nickname" required type="text" />
                    <label for="nickname">Nickname<span class="text-danger fw-bold ms-2">*</span></label>
                </div>
             </div>
        </div>
        <div class="row mb-4">
            <div class="col">
                <div class="form-floating">
                    <textarea class="form-control" placeholder="Your bio" id="bio" v-model="account.bio" type="text"></textarea>
                    <label for="bio">Your bio</label>
                </div>
            </div>
            <div class="col">
                <div class="form-floating">
                    <select class="form-select pb-1" id="country" v-model="account.country">
                        <option v-for="country in countries" :value="country.name">{{ country.name }}</option>
                    </select>
                    <label for="country">Your country</label>
                </div>
            </div>
        </div>
         <div class="row mb-4">
            <div class="col">
                <label for="avatar">Your avatar</label>
                <input class="form-control" id="avatar" @change="uploadAvatar" type="file" accept="image/*"/>
            </div>
            <div class="w-auto align-self-end">
                <span class="fas fa-trash mb-2" role="button" @click="removeAvatar"></span>
            </div>
            <div class="col">
                <label for="background">Your background</label>
                <input class="form-control" id="background" @change="uploadBackground" type="file" accept="image/*" />
            </div>
            <div class="w-auto align-self-end">
                <span class="fas fa-trash mb-2" role="button" @click="removeBackground"></span>
            </div>
        </div>
        <div class="row" v-if="avatarPreview || backgroundPreview">
            <div class="col-6 d-flex" v-if="avatarPreview">
                <img class="img-thumbnail" :src="avatarPreview" :alt="avatarPreview"/>
            </div>
            <div class="col-6" v-if="backgroundPreview">
                <img class="img-thumbnail" :src="backgroundPreview" :alt="backgroundPreview"/>
            </div>
        </div>
        <div class="d-flex justify-content-between mt-4">
            <div class="ms-2">
                <em>All fields with <span class="text-danger">*</span> are required.</em>
            </div>
            <button @click.prevent="signUp" class="btn btn-outline-primary" type="submit">Sign Up<i class="fas fa-pen-fancy ms-2"></i></button>
        </div>
    </form>
</div>`,
    methods: {
        signUp: function (e) {
            if (this.isValidated(e)){
                this.exists = false
                axios.post('http://localhost:3000/api/account/signup', this.buildForm())
                    .then(res => {
                        if (!res.data.hasOwnProperty("password")) {
                            this.existingId = res.data.username
                            this.exists = true
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
            axios.post('http://localhost:3000/api/account/login', this.account)
                .then(response => {
                    this.$cookies.set("username", response.data.username, 7 * this.day)
                    this.$emit('log-event')
                    this.$parent.$children[0].$emit('log-event')
                    axios.patch('http://localhost:3000/api/account/state', { state: "online" })
                        .then(res => this.$router.push({ name: 'Profile', params: { username: this.account.username }}))
                        .catch(err => console.log(err))
                })
                .catch(err => console.log("l'utente non esiste"))
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
            this.avatarPreview = ""
        },
        removeBackground: function (){
            this.account.backgroundImg = ""
            this.backgroundPreview = ""
        },
        hideExists: function () {
            this.exists = false
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
            form.append('country', this.account.country)
            form.append('avatarImg', this.account.avatarImg)
            form.append('backgroundImg', this.account.backgroundImg)
            form.append('state', this.account.state)
            return form
        }
    },
    mounted() {
        this.getCountries()
    }
}
