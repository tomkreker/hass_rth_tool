function strayPets() {
  // dynamically displays the value of percentage of stray intakes of total intakes in Derived Values
  var total = parseFloat(document.getElementById('input-AllIntake').value);
  var stray = parseFloat(document.getElementById('input-StrayIntake').value);
  var outputPerc = document.getElementById('output-PercStray');

  // if either of the values is missing, no value. if stray > total, does not make sense. otherwise, present as %
  if (isNaN(total) || isNaN(stray)) {
    outputPerc.value = null;
  } else if (stray > total) {
    outputPerc.value = 'Stray intake cannot be larger than total intake';
  } else {
    outputPerc.value = Math.round((stray / total) * 100) + '%';
  }
}

function MasterCalculator() {
  // master function used to perform the calculation and produce a benchmark

	// Define coefficients using model results - hardcoded
  // The model is based on Tom's analysis of RTH rates using SAC data 
  // It is a linear model of the format rth_rate ~ org_type + region + percent_stray+ intake_size_group + SVI
  const coefficients = {
    'intercept': 0.23239,
    'West': 0.0507,
    'Midwest': 0, // baseline
    'Northeast': 0.0305,
    'South': -0.0889,
    'gov' : 0.048, // Government Animal Services
    'con' : 0, // Shelter with Government Contract - baseline
    'nocon' : -0.0664, // Shelter without Government Contract
    'SVI' : -0.1736,
    'perc_stray' : 0.3142, // equivalent to 0.031 for each 0.1 increase 
    'intake_100-500': 0, // baseline
    'intake_500-1500': -0.0385,  
    'intake_1500-3000': -0.0665, 
    'intake_3000+': -0.1149 
  };

  // get selected values based on user input
  var svi = parseFloat(document.getElementById('output-SVI').value); // Example SVI value
  var region = document.getElementById('output-Region').value;
  var orgtype = document.getElementById('input-OrgType').value;
  var intake_size = parseFloat(document.getElementById('input-StrayIntake').value);
  var total_size = parseFloat(document.getElementById('input-AllIntake').value);
  var perc_stray = Math.round(intake_size / total_size * 100) / 100;

  // verify validity of user inputs
  if (intake_size < 100){
    document.getElementById('output-Prediction').value = 'Sorry, this tool does not support shelters with <100 stray intakes';}
  else if (!['Midwest', 'West', 'Northeast', 'South'].includes(region)){
    document.getElementById('output-Prediction').value = 'Invalid region - please select a state';}
  else if (svi === null | isNaN(svi)){
    document.getElementById('output-Prediction').value = 'Missing SVI score - please select state and county';}
  else if (intake_size === null | isNaN(intake_size)){
    document.getElementById('output-Prediction').value = 'Missing stray intake number';
    document.getElementById('output-PercStray').value = null;
  }
  else if (total_size === null | isNaN(total_size)){
    document.getElementById('output-Prediction').value = 'Missing total intake number';
    document.getElementById('output-PercStray').value = null;
  }
  else if (intake_size > total_size){
    document.getElementById('output-Prediction').value = 'Error - stray intake number cannot be larger than total intake';}
  
  // input is valid
  else { 
    // determine intake group
    let intake_group;
    if (intake_size >= 100 && intake_size <= 499) {
      intake_group = 'intake_100-500';
    } else if (intake_size >= 500 && intake_size <= 1499) {
      intake_group = 'intake_500-1500';
    } else if (intake_size >= 1500 && intake_size <= 2999) {
      intake_group = 'intake_1500-3000';
    } else {
      intake_group = 'intake_3000+';
    }

    // get the correct coefficients - numeric are always the same, categorical are based on the chosen value
    const intercept = coefficients['intercept'];
    const sviCoef = coefficients['SVI'];
    const percstrayCoef = coefficients['perc_stray'];
    const regionCoef = coefficients[region];
    const orgCoef = coefficients[orgtype];
    const intakeCoef = coefficients[intake_group];

    // Calculate the value based on coefficients and SVI
    var calculatedValue = intercept + svi * sviCoef + perc_stray * percstrayCoef + regionCoef + orgCoef + intakeCoef;
    //console.log('svi, region, orgtype, perc_stray, intake_size', '\nvalues: ',svi, region, orgtype, perc_stray, intake_size, '\ncoefs: ', sviCoef, regionCoef, orgCoef, percstrayCoef, intakeCoef);
    //console.log('calc value', calculatedValue)

    const min_value = 0.1 // define the minimal RTH benchmark of the tool
    if (calculatedValue < min_value){calculatedValue = min_value;}

    // update output with the rate
    document.getElementById('output-Prediction').value = 'Your Benchmark: '+Math.round(+calculatedValue * 100) + '%';	
    
    // show result text
    document.getElementById('output-Text').style.display = "block"; 

    // set high performence text based on hardcoded top performing shelters by size and type (same data as produced the model)
    const high_perf_values = {
      'intake_100-500': {'gov': 85, 'con':80, 'noncon': 69}, // baseline
      'intake_500-1500': {'gov':75, 'con':66, 'noncon':57},  
      'intake_1500-3000': {'gov':80, 'con':55, 'noncon':25}, 
      'intake_3000+': {'gov':71, 'con':38, 'noncon':24}
    };
    document.getElementById('output-Highperf').innerHTML = 'The highest RTH rate recorded for an organization of your type and intake size was '+
       high_perf_values[intake_group][orgtype]+'%.';

    //document.getElementById('myForm').submit();
  }
}

function states(){
  // this function is loaded upon initialization to load state list and an empty county list which gets updated once a state is selected
  // Define the list of US states
	var state_arr = [
	"Select State",	"Alabama",	"Alaska",	"Arizona",	"Arkansas",	"California",	"Colorado",	"Connecticut",	"Delaware",	"District of Columbia",
  "Florida",	"Georgia",	"Hawaii",	"Idaho",	"Illinois",	"Indiana",	"Iowa",	"Kansas",	"Kentucky",	"Louisiana",	"Maine",	"Maryland",
	"Massachusetts",	"Michigan",	"Minnesota",	"Mississippi",	"Missouri",	"Montana",	"Nebraska",	"Nevada",	"New Hampshire",
	"New Jersey",	"New Mexico",	"New York",	"North Carolina",	"North Dakota",	"Ohio",	"Oklahoma",	"Oregon",	"Pennsylvania",
	"Rhode Island",	"South Carolina",	"South Dakota",	"Tennessee",	"Texas",	"Utah",	"Vermont",	"Virginia",	"Washington",
	"West Virginia",	"Wisconsin",	"Wyoming"	];

	// Populate the state dropdown Nodejs
	var stateSelect = document.getElementById("input-State");

	state_arr.forEach(function(state) {
	  var option = document.createElement("option");
	  option.text = state;
	  option.value = state;
	  stateSelect.appendChild(option);
	});

	// init counties array
	var county_arr = ["Select County"];
	var countySelect = document.getElementById("input-County");
  
  // populate counties array - starts empty and gets updated once a state is selected below
	county_arr.forEach(function(c) {
	  var option = document.createElement("option");
	  option.text = c;
	  option.value = c;
	  countySelect.appendChild(option);
	});

}// states

function getStateRegion(state) {
  // get the region for a given state
  const regionMap = {
      'Connecticut': 'Northeast',      'Maine': 'Northeast',      'Massachusetts': 'Northeast',      'New Hampshire': 'Northeast',
      'Rhode Island': 'Northeast',      'Vermont': 'Northeast',      'New Jersey': 'Northeast',      'New York': 'Northeast',
      'Pennsylvania': 'Northeast',    'District of Columbia': 'Northeast', 
      
      'Illinois': 'Midwest',      'Indiana': 'Midwest',      'Michigan': 'Midwest', 
      'Ohio': 'Midwest',      'Wisconsin': 'Midwest',      'Iowa': 'Midwest',      'Kansas': 'Midwest',      'Minnesota': 'Midwest',
      'Missouri': 'Midwest',      'Nebraska': 'Midwest',      'North Dakota': 'Midwest',      'South Dakota': 'Midwest',
      
      'Delaware': 'South',      'Florida': 'South',      'Georgia': 'South',      'Maryland': 'South',      'North Carolina': 'South',
      'South Carolina': 'South',      'Virginia': 'South',      'West Virginia': 'South',      'Alabama': 'South',
      'Kentucky': 'South',      'Mississippi': 'South',      'Tennessee': 'South',      'Arkansas': 'South',      'Louisiana': 'South',
      'Oklahoma': 'South',      'Texas': 'South',

      'Arizona': 'West',      'Colorado': 'West',      'Idaho': 'West',      'Montana': 'West',      'Nevada': 'West',
      'New Mexico': 'West',      'Utah': 'West',      'Wyoming': 'West',      'Alaska': 'West',      'California': 'West',
      'Hawaii': 'West',      'Oregon': 'West',      'Washington': 'West',
    
      'Select State': 'Select State'};
  return regionMap[state] || 'Unknown';
}

// load states and counties
document.addEventListener('DOMContentLoaded', () => {
  states(); // load states

  // load state, county, and region objects
  const stateSelect = document.getElementById('input-State');
  const countySelect = document.getElementById('input-County');
  const outputRegion = document.getElementById('output-Region'); 
  const outputSVI = document.getElementById('output-SVI'); 
  const strayInput = document.getElementById('input-StrayIntake'); 
  const totalInput = document.getElementById('input-AllIntake'); 
  const outputText = document.getElementById('output-Text'); 

  // Event listener for state selection change
  stateSelect.addEventListener('change', () => {
    const selectedState = stateSelect.value; // selected value of state

    // update region based on selected state
    const selectedRegion = getStateRegion(selectedState);
    outputRegion.textContent = selectedRegion; // Update the output element
    outputRegion.value = selectedRegion;

      // update counties - HTTP request to get counties from the json data
    fetch(`/counties/${selectedState}`)
      .then(response => response.json())
      .then(counties => {
          // Clear existing options
          countySelect.innerHTML = '';
          if (counties.length === 0) {
            // If no counties, create an option with the selected state
            const option = document.createElement('option');
            option.value = selectedState;
            option.textContent = selectedState;
            countySelect.appendChild(option);
          }  else { // make the counties the options in the County select
            counties.forEach(county => {
                const option = document.createElement('option');
                option.value = county;
                option.textContent = county;
                countySelect.appendChild(option);
            });
            // Trigger a change event on county select to fetch SVI for the first county
            countySelect.dispatchEvent(new Event('change'));
          }
    });
  });

  // event listener for county change to fetch SVI value
  countySelect.addEventListener('change', () => {
    const selectedState = stateSelect.value;
    const selectedCounty = countySelect.value;

    // Call the function to get SVI value
    fetch(`/svi/${selectedState}/${selectedCounty}`)
      .then(response => response.json())
      .then(data => data.sviValue)
      .then(sviValue => {
        // Update the output element with the SVI value
        outputSVI.value = sviValue;
      });
  });
  // event listeners for change in total or stray pets to change their values
  strayInput.addEventListener('change', () => {
    strayPets();
  });
  totalInput.addEventListener('change', () => {
    strayPets();
  });
  // turn result text off - it is shown when the Calculate button is clicked
  outputText.style.display = "none";
});


