<script setup>
import { io } from "socket.io-client";
import { ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const connected = ref(false);
const space = ref(null);
const socket = io();

const handleClick = (space) => {
    console.log("clicked", space);
    socket.emit("flash", space.id);
};

//connection
socket.on("connect", () => {
    console.log("connected");
    connected.value = true;

    //join the space
    socket.emit("join", route.params.id.toLowerCase());

    socket.on("data", (data) => {
        console.log("recieved", data);
        space.value = data;
    });
});

socket.on("disconnect", () => {
    console.log("disconnected");
    connected.value = false;
});

</script>

<template>
    <div>
        <h1>Call</h1>
        <p v-if="connected">connected</p>
        <p v-if="!connected">disconnected</p>
        <div v-if="connected && space" class="button-container">
            <button :class="{ 'flash-red': space.flash, 'solid': !space.flash}"
                @click="handleClick(space)">
                {{ space.name }}
            </button>
        </div>
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
</style>
