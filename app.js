// Search App - A re-usable react component
class SearchApp extends React.Component {

	constructor(props) {
  	super(props);

    // Bind for all event handlers
    this.searchSuggestions = this.searchSuggestions.bind(this);
    this.showPotentialSuggestions = this.showPotentialSuggestions.bind(this);
    this.navigateResults = this.navigateResults.bind(this);
    this.emptyPotentialSuggestions = this.emptyPotentialSuggestions.bind(this);

		// Initial react state
		this.state = {
	    searchTerm: '',
      potentialResults: [
      	{ id: 1, value: 'Alcatraz Island'},
      	{ id: 2, value: 'Lake Tahoe'},
        { id: 3, value: 'Napa Valley'},
        { id: 4, value: 'Yosemite'},
        { id: 5, value: 'Santa Clara'},
				{ id: 6, value: 'Santa Cruz'},
				{ id: 7, value: 'Santa Ana'},
        { id: 8, value: 'San Francisco'},
        { id: 9, value: 'Palo Alto'},
        { id: 10, value: 'Sunnyvale'},
      ],
    	filteredResults: [], // filtered results, items are pushed within the getSuggestions function at the end
			selectedResultId: 0,
      apiFailed: false // flag to capture API failure state
    };
  }

  // Event for searchbox value change
	searchSuggestions(e) {
  	const searchTerm = e.target.value;
    const searchTermArr = searchTerm.split(' ');
	  const currentThis = this;

		// Passing only last word in the search sentence, delimited via space
  	getSuggestions(searchTermArr[searchTermArr.length - 1], this.state.potentialResults)
    .then(response => {
    		// set success state incase of success
      	currentThis.setState({ searchTerm: searchTerm, filteredResults: response, apiFailed: false});
    })
    .catch(err => {
    	// set failure state incase of failure
      currentThis.setState({ searchTerm: searchTerm, filteredResults: [], apiFailed: true,});
    })
  }

  // show all potential suggestions on search box focus/plain click on search box
  showPotentialSuggestions(e) {
  	this.setState({ filteredResults: this.state.potentialResults});
  }

  // handle on focus out of search box. Empty out results
  emptyPotentialSuggestions(e) {
  	this.setState({ filteredResults: [], selectedResultId: 0});
  }

  // Navigate and access results via up, down and enter keys
  navigateResults(e) {
		switch (e.keyCode) {
    	case 38: // up arrow
      	if(this.state.selectedResultId !=0) {
	        this.setState({ selectedResultId: this.state.selectedResultId - 1});
        }
        break;
      case 40: // down arrow
      	if(this.state.selectedResultId < this.state.filteredResults.length) {
	        this.setState({ selectedResultId: this.state.selectedResultId + 1, });
        }

        break;
      case 13: // enter key
          if(this.state.selectedResultId !=0) {
          	this.state.filteredResults.forEach(resultItem => {
            	if(resultItem.id === this.state.selectedResultId) {
              	// set searchBox value with space at the end
              	this.setState({ searchTerm: resultItem.value});

                // Ideally we don't have to do this. We can just set a defaultValue attribute set to the searchTerm value on the search box, however defaultValue attribute does not seem to be working atleast for me within the jsFiddle environment. Altough it is working locally in an editor. So, setting selected value via plain JS with a trailing space
                document.getElementById('searchBox').value = resultItem.value + ' ';
              }
          	});
          }
        break;
    }
  }

  	// returns result Item with search terms being highlighted
    getHighlightedText(searchTerm, higlight) {
      let parts = searchTerm.split(new RegExp(`(${higlight})`, 'gi'));
      return <span> { parts.map((part, i) =>
                <span key={i} className={part.toLowerCase() === higlight.toLowerCase() ? 'highlight' : {} }>
                    { part }
                </span>)
      } </span>;
		}

  render() {
    return (
    <div>
      <nav className="row text-center"><h3>Search Suggestions</h3></nav>
      <main className="container">
        <div className="col-xs-7 col-xs-offset-2">
          <input
            type="text"
            id="searchBox"
            className="form-control"
            placeholder="Search Suggestions"
            onChange={this.searchSuggestions}
            onFocus={this.showPotentialSuggestions}
            onKeyDown={this.navigateResults}
            onBlur={this.emptyPotentialSuggestions}/>
          {
          	this.state.filteredResults.length > 0 && (
            	<ul className="list-group suggestions">
            	{
              	this.state.filteredResults.map(resultItem => (
                <li
                  className={resultItem.id === this.state.selectedResultId ? "list-group-item suggestionResultItem selectedItem" : "list-group-item suggestionResultItem" }
                  key={resultItem.id}
                  data-result-value={resultItem.value}>
                  {this.getHighlightedText(resultItem.value, this.state.searchTerm)}
               </li>
                ))
              }
              </ul>
            )
          }
          {
          	this.state.apiFailed && (
            <p className="alert alert-danger">Something went wrong. Please try again...</p>
            )
          }
        </div>
      </main>
    </div>
    );
  }
}

ReactDOM.render(
  <SearchApp />,
  document.getElementById('searchApp')
);

// ================= Mock Server Start ======================
const FAILURE_COEFF = 10;
const MAX_SERVER_LATENCY = 200;

function getRandomBool(n) {
  const maxRandomCoeff = 1000;
  if (n > maxRandomCoeff) n = maxRandomCoeff;
  return Math.floor(Math.random() * maxRandomCoeff) % n === 0;
}

function getSuggestions(searchTerm, potentialResults) {
	let filteredResults = [];
	return new Promise((resolve, reject) => {
  	setTimeout(() => {
      if (getRandomBool(FAILURE_COEFF)) {
        reject();
      } else {
      	potentialResults.forEach(resultItem => {
        	if(resultItem.value.toUpperCase().indexOf(searchTerm.toUpperCase()) > -1) {
          	filteredResults.push({
            id: filteredResults.length + 1,
            value: resultItem.value
            });
          }
        });

        resolve(filteredResults);
      }
    }, MAX_SERVER_LATENCY);
  });
}
