// src/utils/eventBus.js
const eventBus = {
  listeners: {},
  
  // Event listen karne ke liye
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },
  
  // Event trigger karne ke liye
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
};

export default eventBus;