<script setup>
import { io } from "socket.io-client";
import { ref } from "vue";
const connected = ref(false);
const spaces = ref([]);
const unregistered = ref([]);
const isModalOpen = ref(false);
const modalData = ref({
  id: "",
  name: "",
  space: "",
});

const socket = io();

//connection
socket.on("connect", () => {
  console.log("connected");
  connected.value = true;
  socket.emit("join", "dashboard");
});

socket.on("data", (data) => {
  console.log(data);

  //check to see if the space exists in array and add if not
  for (let i = 0; i < spaces.value.length; i++) {
    if (spaces.value[i].name == data.name) {
      spaces.value[i] = data;
      return;
    }
  }
  spaces.value.push(data);
});

socket.on("unregistered", (ids) => {
  console.log("unregistered", ids);
  unregistered.value = ids;
})

socket.on("disconnect", () => {
  console.log("disconnected");
  connected.value = false;
});

const handleClick = (space) => {
  console.log("clicked", space);
  socket.emit("flash", space.id);
}

const handleUnregisteredClick = (id) => {
  console.log("clicked", id);
  modalData.value.id = id;
  modalData.value.name = "";
  modalData.value.space = "";
  isModalOpen.value = true;
}

const closeModal = () => {
  isModalOpen.value = false;
}

const registerDevice = () => {
  console.log("registering", modalData.value);
  if (modalData.value.name == "" || modalData.value.space == "") {
    console.log("fields were not filled");
    isModalOpen.value = false;
    return;
  }
  socket.emit("register", modalData.value);
  isModalOpen.value = false;
}
</script>

<template>
  <div>
    <h1>Dashboard</h1>
    <p v-if="connected">connected</p>
    <p v-if="!connected">disconnected</p>
    <div v-if="connected" class="button-container">
      <button v-for="(space, index) in spaces" :key="index" @click="handleClick(space)"
        :class="{ 'flash-red': space.flash, 'solid': !space.flash }">
        {{ space.name }}
      </button>
    </div>
    <div v-if="unregistered.length > 0">
      <h1>Unregistered</h1>
      <p v-for="(id, index) in unregistered" :key="index" @click="handleUnregisteredClick(id)">{{ id }}</p>
    </div>
  </div>

  <!-- Modal component -->
  <div v-if="isModalOpen" class="modal">
    <button id="close" @click="closeModal">x</button>
    <h1>{{ modalData.id }}</h1>
    <label for="name">Name:</label>
    <input type="text" v-model="modalData.name" id="name" />
    <br />
    <label for="space">Select a space:</label>
    <select v-model="modalData.space" id="space">
      <option v-for="space in spaces" :key="space.id" :value="space.id">{{ space.name }}</option>
    </select>
    <button @click="registerDevice">register</button>
  </div>
</template>

<style scoped>
.button-container {
  display: flex;
  justify-content: space-between;
  /* Adjust as needed */
}

button {
  padding: 10px;
  margin: 5px;
  background-color: #3498db;
  color: #fff;
  border: none;
  cursor: pointer;
  width: 250px;
  height: 100px;
}

.flash-red {
  background-color: #ff0000;
  animation: flash 1s infinite alternate;
}

.solid {
  background-color: #3498db;
  /* Solid color */
}

@keyframes flash {
  from {
    background-color: #ff0000;
  }

  to {
    background-color: #3498db;
  }
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  border: 1px solid #ccc;
  background-color: var(--color-background);
}

.modal button {
  padding: 10px;
  margin: 5px;
  background-color: #3498db;
  color: #fff;
  border: none;
  cursor: pointer;
  width: 100px;
  height: 50px;
}

.modal input {
  padding: 10px;
  margin: 5px;
  width: 60%;
  height: 50px;
}

.modal select {
  padding: 10px;
  margin: 5px;
  width: 60%;
  height: 50px;
}

#close {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 15px;
  background: none;
  border: none;
  cursor: pointer;
  color: #fff;
  width: 20px;
  height: 20px;
  padding: 0;
  margin: 0;
}
</style>
