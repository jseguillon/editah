// Most of credits goes to :  https://codepen.io/ph1p/pen/GEJYBZ
<template>
  <div class="autocomplete ui icon input">
    <input :id="id" ref="autoinput" class="autocomplete-input" :placeholder="placeholder" @focusout="focusout" @focus="focus" @keydown.13="chooseItem" @keydown.tab="chooseItem" @keydown.40="moveDown" @keydown.38="moveUp" v-model="inputValue" type="text"/>


    <ul :class="{
      'autocomplete-list': true,
      [id+'-list']: true
    }" v-if="searchMatch.length > 0 && ! doingRandom">
      <li :class="{active: selectedIndex === index}" v-for="(result, index) in searchMatch" :key="`result-${index}`" @click="selectItem(index), chooseItem()" v-html="highlightWord(result)">

      </li>
    </ul>
    <i class="random link icon" @click="debouncedRandomItem()"></i>
  </div>
</template>

<script>
const debounce = (callback, wait) => {
  let timeoutId = null;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback.apply(null, args);
    }, wait);
  };
}

export default {
  name: 'AutoComplete',
  props: ["items", "placeholder", "label", "textarea", "rows", "cols"],
  data() {
    return {
      id: 'input-' + parseInt(Math.random() * 1000),
      inputValue: "",
      searchMatch: [],
      selectedIndex: 0,
      clickedChooseItem: false,
      wordIndex: 0,
      doingRandom: false
    };
  },
  mounted() {
    this.focusInput()
  },
  computed: {
    listToSearch() {
      return this.items;
    },
    currentWord() {
      return this.inputValue.replace(/(\r\n|\n|\r)/gm, ' ').split(' ')[this.wordIndex];
    },
    inputSplitted() {
      return this.inputValue.replace(/(\r\n|\n|\r)/gm, ' ').split(" ");
    }
  },
  watch: {
    inputValue() {
      this.focus();
      this.selectedIndex = 0;
      this.wordIndex = this.inputSplitted.length - 1;
    }
  },
  methods: {
    debouncedRandomItem() {
      this.randomItem(this)
    },
    //This is hack to avoid blinking effect on input onchange event (we are not typing text !)
    randomItem: debounce( (vm) => {
      //block autocompletion render
      vm.doingRandom = true

      var rand = Math.floor(Math.random() * vm.listToSearch.length);

      //fast on event
      setTimeout(() => {
        vm.inputValue = vm.listToSearch[rand]
        vm.$emit('selected', vm.inputValue)
      }, 1)

      //slow on releasing render lock
      setTimeout(() => vm.doingRandom = false, 150)
    }, 150),
    focusInput() {
      this.$refs.autoinput.focus();
    },
    highlightWord(word) {
      const regex = new RegExp("(" + this.currentWord + ")", "ig");
      return word.replace(regex, '<mark>$1</mark>');
    },
    setWord(word) {
      let currentWords = this.inputValue.replace(/(\r\n|\n|\r)/gm, '__br__ ').split(' ');
      currentWords[this.wordIndex] = currentWords[this.wordIndex].replace(this.currentWord, word + ' ');
      this.wordIndex += 1;
      this.inputValue = currentWords.join(' ').replace(/__br__\s/g, '\n');
    },
    moveDown() {
      if (this.selectedIndex < this.searchMatch.length - 1) {
        this.selectedIndex++;
      }
    },
    moveUp() {
      if (this.selectedIndex !== -1) {
        this.selectedIndex--;
      }
    },
    selectItem(index) {
      this.selectedIndex = index;
      this.chooseItem();
    },
    chooseItem(e) {
      this.clickedChooseItem = true
      if (this.selectedIndex !== -1 && this.searchMatch.length > 0) {
        if (e) {
          e.preventDefault();
        }
        this.setWord(this.searchMatch[this.selectedIndex])
        this.inputValue=this.searchMatch[this.selectedIndex]
        this.$emit('selected', this.inputValue, e)
        this.selectedIndex = -1;
      }
    },
    focusout() {
      setTimeout(() => {
        if (!this.clickedChooseItem) {
          this.searchMatch = [];
          this.selectedIndex = -1;
        }
        this.clickedChooseItem = false;
      }, 100);
    },
    focus() {
      this.searchMatch = [];
      if (this.currentWord !== "" && this.currentWord != undefined ) {
        this.searchMatch = this.listToSearch.filter(
          //filter on regex from all terms of splitted input
          el => el.match(new RegExp('(?=.*' + this.inputSplitted.join(')(?=.*') + ').+', "i"))
        );
      }
      if (
        this.searchMatch.length === 1 &&
        this.currentWord === this.searchMatch[0]
      ) {
        this.searchMatch = [];
      }
    }
  }
}
</script>

<style>
.autocomplete {
  position: relative;
  text-align: left;
}
.autocomplete label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  font-weight: 100;
}
.autocomplete-input {
  padding: 7px 10px;
  width: 93%;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}
.autocomplete-input:focus {
  border-color: #000;
}
.autocomplete-list {
  position: absolute;
  z-index: 2;
  overflow: auto;
  min-width: 250px;
  max-height: 500px;
  margin: 0px;
  margin-top: 30px;
  padding: 0px;
  border: 1px solid #eee;
  list-style: none;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.05);
}
.autocomplete-list li {
  margin: 0;
  padding: 8px 15px;
  border-bottom: 1px solid #f5f5f5;
}
.autocomplete-list li:last-child {
  border-bottom: 0;
}
.autocomplete-list li:hover, .autocomplete-list li.active {
  background-color: #f5f5f5;
}
</style>
