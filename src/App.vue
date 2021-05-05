<template>
  <div id="app">
    <div id="nav">
      <router-link to="/Cloud_YAML">Cloud_YAML</router-link> <!--|
      <a style="cursor: pointer;" @click="toggleDonate()">
        <i class="ui icon dollar"/>Donate<i class="ui icon btc"/>
      </a>
      <a style="float: right;display:block;cursor: pointer;" @click="toggleShareNetwork()" >
        <i class="ui right  icon share">

        </i>Share
      </a>  -->
    </div>
    <router-view />
    <!-- FIXME : some media queries for correct btc render on mobile : input + copy button, no QR -->
    <!-- FIXME : debounce toggles -->
    <div class="ui dimmer" style="z-index: 200000; background-color: rgba(0, 0, 0, 0.95);" v-bind:class="{ 'active': isDonateActive }" @click="toggleDonate()">
      <div class="content">
        <img src="@/assets/raining-money.gif" />
        <h2 ref="btcHeader" class="ui header" style="color: white;cursor: pointer;" data-tooltip="Click to copy Btc address in clipboard or scan QR code" @click.prevent.stop="copyClipboardBtcAdress()">
            <i class="large inverted icons" style="color: white; ">
              <i class="btc icon" style="color: white;"></i>
            </i>
            {{ btcAddress }}
            <br/>
            <img src="btcQr.png"  style="width:33%" />
          </h2>
          <h2 class="ui header" style="color: white;cursor: pointer;" data-tooltip="Click to open Lydia donation" @click="openDonate()">
            <div>
            <i class="large inverted icons" style="color: white; ">
              <i class="dollar icon" style="color: white;"></i>
            </i>
            /
            <i class="large inverted icons" style="color: white; margin-left: 5px">
               <i class="euro icon" style="color: white;"></i>
            </i>
            <a style="color:white;display: inline-block;cursor: pointer;" >https://lydia-app.com/collect/34231-jseguillon</a>
            </div>
          </h2>
      </div>
    </div>
    <div class="ui dimmer" style="z-index: 200000; background-color: rgba(0, 0, 0, 0.95);" v-bind:class="{ 'active': isShareNetworkActive }" @click="toggleShareNetwork()">
      <div class="content">
        <h1 class="ui inverted icon header">
          Spread the world !
        </h1>

        <p style="margin-top: 40px">
        <ShareNetwork style="color: white;"
            network="twitter"
            url="https://editah.io"
            title="Editah.io launches *Cloud_YAML*: online editor and validator for Kubernetes YAMLs. It keeps your data private, because it uses no backend !"
            hashtags="editah,kubernetes,yaml,online,devops"
            twitter-user="IoEditah"
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
            title="Editah.io launches *Cloud_YAML*: online editor and validator for Kubernetes YAMLs. It keeps your data private, because it uses no backend !"
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
            title="Editah.io launches *Cloud_YAML*: online editor and validator for Kubernetes YAMLs. No backend = keep your data private !"
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
    copyClipboardBtcAdress() {
      this.$copyText(this.btcAddress).then(function () {
      }, function () {
        alert('Can not copy')
      })

      this.$refs.btcHeader.setAttribute("data-tooltip", "Btc address now in cliboard !")
      setTimeout(() => this.$refs.btcHeader.setAttribute("data-tooltip", "Click to copy Btc address in clipboard or scan QR code"), 3000)
    },
    openDonate(){
      window.open("https://lydia-app.com/collect/34231-jseguillon", '_blank');
    },
    toggleShareNetwork() {
      return this.isShareNetworkActive = ! this.isShareNetworkActive
    },
    toggleDonate() {
      return this.isDonateActive = ! this.isDonateActive
    }
  },
  data() {
    return {
      isShareNetworkActive: false,
      isDonateActive: false,
      btcAddress: "bc1qjc907aq30thvegk42v9hs2prks6ugyw4ylgdu7znw26fmn6570uqdqmsxj"
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
