<script setup>
    import logo from '../../assets/img/logo.png'

    import { ref } from 'vue';
    import axios from 'axios';
    import { useRouter } from 'vue-router';

    // Reactive variables for email and password
    const email = ref('');
    const password = ref('');

    // Router instance
    const router = useRouter();

    // Function to handle form submission
    const handleSubmit = async (event) => {
      event.preventDefault();

      try {
        console.log(email.value, password.value)

        const response = await axios.post('http://localhost:5000/api/login', {
          email: email.value,
          password: password.value
        });

        if (response.data.access_token) {
          router.push('/dashboard');
        } else {
          console.error('Login failed: Invalid credentials');
        }
      } catch (error) {
        console.error('Login failed:', error.message);
      }
    };
</script>

<template>
    <main>
        <div class="container">

          <section class="section register min-vh-100 d-flex flex-column align-items-center justify-content-center py-4">
            <div class="container">
              <div class="row justify-content-center">
                <div class="col-lg-4 col-md-6 d-flex flex-column align-items-center justify-content-center">

                  <div class="d-flex justify-content-center py-4">
                    <a href="#" class="logo d-flex align-items-center w-auto">
                      <img :src="logo" alt="">
                      <span class="d-none d-lg-block">Selamat Datang</span>
                    </a>
                  </div>

                  <div class="card mb-3">
                    <div class="card-body">
                      <div class="pt-4 pb-2">
                        <h5 class="card-title text-center pb-0 fs-4">Login to Your Account</h5>
                        <p class="text-center small">Enter your email & password to login</p>
                      </div>

                      <form @submit="handleSubmit" class="row g-3 needs-validation" novalidate>
                        <div class="col-12">
                          <label for="yourEmail" class="form-label">email</label>
                          <div class="input-group has-validation">
                            <span class="input-group-text" id="inputGroupPrepend">@</span>
                            <input v-model="email" type="text" name="email" class="form-control" id="yourEmail" required>
                            <div class="invalid-feedback">Please enter your email.</div>
                          </div>
                        </div>

                        <div class="col-12">
                          <label for="yourPassword" class="form-label">Password</label>
                          <input v-model="password" type="password" name="password" class="form-control" id="yourPassword" required>
                          <div class="invalid-feedback">Please enter your password!</div>
                        </div>

                        <div class="col-12">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="remember" value="true" id="rememberMe">
                            <label class="form-check-label" for="rememberMe">Remember me</label>
                          </div>
                        </div>
                        <div class="col-12">
                          <button class="btn btn-primary w-100" type="submit">Login</button>
                        </div>
                       <div class="col-12">
                            <p class="small mb-0">Don't have an account? <router-link to="/register">Create an account</router-link></p>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
</template>

<script>
export default {
    name: 'LoginView',
    mounted() {
      /**
        * Initiate Bootstrap validation check
      */
      var needsValidation = document.querySelectorAll('.needs-validation')

      Array.prototype.slice.call(needsValidation)
        .forEach(function (form) {
          form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
              event.preventDefault()
              event.stopPropagation()
            }

            form.classList.add('was-validated')
          }, false)
        });
    }
}
</script>

<style scope>
    h1 {
        color: red;
    }
</style>