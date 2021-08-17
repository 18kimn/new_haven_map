import * as d3 from 'd3'
import posts from '../assets/text/posts.json'
// A short utility function to display the sidebar text
// Arguments: 
//    index: The index of the map (intro is 0, properties is 1, etc). 
//    callback: The function to execute when the 'next' button is clicked. Usually a transition to the next map. 

const displayText = (index) => {
  d3.selectAll('.story-body')
    .html(posts[index])
}

export default displayText
