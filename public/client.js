// client-side js
// run by the browser each time your view template referencing it is loaded

console.log('hello world :o');

let dreams = [];

// define variables that reference elements on our page
const dreamsList = document.getElementById('dreams');
const dreamsForm = document.forms[0];
const dreamInput = dreamsForm.elements['dream'];
const authorInput = dreamsForm.elements['author'];


// a helper function to call when our request for dreams is done
const getDreamsListener = function() {
  // parse our response to convert to JSON
  dreams = JSON.parse(this.responseText);

  // iterate through every dream and add it to our page
  dreams.forEach( function(row) {
    appendNewDream(row.dream + ", " + row.name);
  });
}

// request the dreams from our app's sqlite database
const dreamRequest = new XMLHttpRequest();
dreamRequest.onload = getDreamsListener;
dreamRequest.open('get', '/getDreams');
dreamRequest.send();

// a helper function that creates a list item for a given dream
const appendNewDream = function(dream) {
  const newListItem = document.createElement('li');
  newListItem.innerHTML = dream;
  dreamsList.appendChild(newListItem);
}

// listen for the form to be submitted and add a new dream when it is
dreamsForm.onsubmit = function(event) {
  // stop our form submission from refreshing the page
  event.preventDefault();

  // get dream value and add it to the list
  dreams.push(dreamInput.value);
  appendNewDream(dreamInput.value + ", " + authorInput.value);
  
  // send dream value to the database
    fetch("/postDream", {
      method: 'POST',  
      body: JSON.stringify({
        dream: dreamInput.value,
        author: authorInput.value
      }),  
      headers:{
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(response => console.log('Success:', response))
      .catch(error => console.error('Error:', error));

  // reset form 
  dreamInput.value = '';
  authorInput.value = '';
  dreamInput.focus();
};
