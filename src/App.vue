<template>
  <div id="app">
    <div id="nav">
      <router-link to="/Cloud_YAML">Cloud_YAML</router-link> |
      <router-link to="/about">About</router-link>
      <a style="float: right;display:block;cursor: pointer;" @click="toggleShareNetwork()" >
        <i class="ui right  icon share">

        </i>Share
      </a>
    </div>
    <router-view />
    <div class="ui dimmer" style="background-color: rgba(0, 0, 0, 0.95);" v-bind:class="{ 'active': isShareNetworkActive }" @click="toggleShareNetwork()">
      <div class="content">
        <h1 class="ui inverted icon header">
          Spread the world !
        </h1>

        <p style="margin-top: 40px">
        <ShareNetwork style="color: white;"
            network="twitter"
            url="https://editah.io"
            title="Editah.io launches *Cloud-YAML*: online editor and validator for Kubernetes YAMLs. Serverless !"
            hashtags="kubernetes,devops,online,yaml"
          >
          <h2 class="ui header" style="color: white;">
            <i class="large inverted icons" style="color: white; ">
              <i class="twitter icon" style="color: white;"></i>
              <i class="inverted corner share icon" style="color: white;"></i>
            </i>
            Twitter
          </h2>
        </ShareNetwork>
        <br/>
        <br/>
        <ShareNetwork style="color: white;"
            network="reddit"
            url="https://editah.io"
            title="Editah.io launches *Cloud-yaml*: online editor and validator for Kubernetes YAMLs. Serverless !"
            hashtags="kubernetes,devops,online,yaml"
          >
          <h2 class="ui header" style="color: white;">
            <i class="large inverted icons" style="color: white; ">
              <i class="reddit icon" style="color: white;"></i>
              <i class="inverted corner share icon" style="color: white;"></i>
            </i>
            Reddit
          </h2>
        </ShareNetwork>
        <br/>
        <br/>
        <ShareNetwork style="color: white;"
            network="linkedin"
            url="https://editah.io"
            title="Editah.io launches *Cloud-yaml*: online editor and validator for Kubernetes YAMLs. Serverless !"
            hashtags="kubernetes,devops,online,yaml"
          >
          <h2 class="ui header" style="color: white;">
            <i class="large inverted icons" style="color: white; ">
              <i class="linkedin icon" style="color: white;"></i>
              <i class="inverted corner share icon" style="color: white;"></i>
            </i>
            LinkedIn
          </h2>
        </ShareNetwork>
        </p>
      </div>
    </div>

  </div>

</template>

<script>
export default {
  created() {

  },
  mounted() {

  },
  computed: {

  },
  methods: {
    toggleShareNetwork() {
      return this.isShareNetworkActive = ! this.isShareNetworkActive
    }
  },
  data() {
    return {
      isShareNetworkActive: false
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
