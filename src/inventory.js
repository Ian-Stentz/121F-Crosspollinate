// Inventory object to hold plant IDs and their counts
const inventory = {
    plants: {},
  
    // Get the count of a plant by its ID
    getPlantCount: function(id) {
      return this.plants[id] || 0;
    },
  
    // Set the count of a plant by its ID
    setPlantCount: function(id, count) {
      this.plants[id] = count;
    },
  
    // Add plants to the inventory (increase count)
    addPlant: function(id, count) {
      this.plants[id] = (this.plants[id] || 0) + count;
    },
  
    // Remove plants from the inventory (decrease count)
    removePlant: function(id, count) {
      if (this.plants[id]) {
        this.plants[id] = Math.max(this.plants[id] - count, 0);
      }
    },

    //implementation varies with the rules of the win condition
    //currently checks if the inv contains one of each plant
    checkWinConditions: function(plantTypeKeys) {
      let winCondition = true;
      for (let key of plantTypeKeys) {
        if (this.getPlantCount(key) < 1) {
          winCondition = false;
          break;
        }
      }
      return winCondition
    }
  };

  // Example usage in main
  // Add the harvested crop to the inventory (e.g., adding "plant0")
  //inventory.addPlant("plant0", 1);  // Increase plant count by 1 in the inventory