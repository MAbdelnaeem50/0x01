<script setup>
import { useGenerateImageVariant } from "@/@core/composable/useGenerateImageVariant";
import AuthProvider from "@/views/pages/authentication/AuthProvider.vue";
import authV2LoginIllustrationBorderedDark from "@images/pages/auth-v2-login-illustration-bordered-dark.png";
import authV2LoginIllustrationBorderedLight from "@images/pages/auth-v2-login-illustration-bordered-light.png";
import authV2LoginIllustrationDark from "@images/pages/auth-v2-login-illustration-dark.png";
import authV2LoginIllustrationLight from "@images/pages/auth-v2-login-illustration-light.png";
import authV2LoginMaskDark from "@images/pages/auth-v2-login-mask-dark.png";
import authV2LoginMaskLight from "@images/pages/auth-v2-login-mask-light.png";
import { VNodeRenderer } from "@layouts/components/VNodeRenderer";
import { themeConfig } from "@themeConfig";
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

definePage({
  meta: {
    layout: "blank",
    public: true,
  },
});

const form = ref({
  username: "",
  password: "",
  remember: false,
});

const isPasswordVisible = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const router = useRouter();

const authV2LoginMask = useGenerateImageVariant(
  authV2LoginMaskLight,
  authV2LoginMaskDark
);
const authV2LoginIllustration = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark,
  true
);

const login = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await axios.post(
      "http://197.134.253.234:9000/en/auth/jwt/create/",
      {
        username: form.value.username,
        password: form.value.password,
      }
    );

    const token = response.data.access;
    localStorage.setItem("token", token);
    console.log("Login Successful");

    router.push("/");
  } catch (error) {
    console.error("Login error:", error);
    if (error.response) {
      errorMessage.value =
        error.response.data.detail ||
        "An error occurred during login. Please try again.";
    } else if (error.request) {
      errorMessage.value =
        "No response received from the server. Please try again later.";
    } else {
      errorMessage.value = "An error occurred during login. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <a href="javascript:void(0)">
    <div class="app-logo auth-logo">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="app-logo-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </a>

  <VRow no-gutters class="auth-wrapper">
    <VCol md="8" class="d-none d-md-flex align-center justify-center position-relative">
      <div class="d-flex align-center justify-center pa-10">
        <img :src="authV2LoginIllustration" class="auth-illustration w-100" alt="auth-illustration" />
      </div>
      <VImg :src="authV2LoginMask" class="d-none d-md-flex auth-footer-mask" alt="auth-mask" />
    </VCol>
    <VCol cols="12" md="4" class="auth-card-v2 d-flex align-center justify-center"
      style="background-color: rgb(var(--v-theme-surface))">
      <VCard flat :max-width="500" class="mt-12 mt-sm-0 pa-5 pa-lg-7">
        <VCardText>
          <h4 class="text-h4 mb-1">
            Welcome to
            <span class="text-capitalize">{{ themeConfig.app.title }}! 👋🏻</span>
          </h4>

          <p class="mb-0">
            Please sign-in to your account and start the adventure
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="login">
            <VRow>
              <VCol cols="12">
                <VTextField v-model="form.username" autofocus label="Username" placeholder="johndoe" />
              </VCol>

              <VCol cols="12">
                <VTextField v-model="form.password" label="Password" placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'" :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'
                    " @click:append-inner="isPasswordVisible = !isPasswordVisible" />

                <div class="d-flex align-center justify-space-between flex-wrap my-6 gap-x-2">
                  <VCheckbox v-model="form.remember" label="Remember me" />

                  <a class="text-primary" href="javascript:void(0)">
                    Forgot Password?
                  </a>
                </div>

                <VBtn block type="submit" :loading="loading" :disabled="loading">
                  Login
                </VBtn>

                <VAlert v-if="errorMessage" type="error" class="mt-4">
                  {{ errorMessage }}
                </VAlert>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
