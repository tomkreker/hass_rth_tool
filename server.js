const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
//const http = require('http');
const fs = require('fs');
const path = require('path');

//var tools = require('./static/Calculator.js'); // import custom functions -- removed by TK

app.use(bodyParser.urlencoded({extended: true}));
app.use('/static', express.static(__dirname + '/static'));

// Read the JSON file with state and county data + svi data
//const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'counties_list.json'))); // using the SVI file for loading counties
const data_svi = JSON.parse(fs.readFileSync(path.join(__dirname, 'svi_county_2020.json')));

// code to make it possible to make a request for the counties when a state is chosen
app.get('/counties/:state', (req, res) => {
  const state = req.params.state;
  const counties = data_svi.filter(entry => entry.STATE === state).map(entry => entry.COUNTY); // changed from data to data_svi and State to STATE, County to COUNTY
  res.json(counties);
});

// code to make it possible to make a request the SVI when county is chosen
app.get('/svi/:state/:county', (req, res) => {
    const county = req.params.county;
    const state = req.params.state;
    
    // find the correct county
    const filteredData = data_svi.filter(entry => entry.STATE === state && entry.COUNTY === county);
    if (filteredData.length > 0) {
        const sviValue = filteredData[0].SVI; // return the SVI value
        res.json({ sviValue });
    } else {
        res.json({ sviValue: null }); // Return null if no matching entry is found
    }
  });
  
//mongoose.connect("mongodb+srv://AmPAHASS:allsheltersplease@testingcluster.g0jphxj.mongodb.net/BudgetCalculator", {useNewUrlParser: true}, {useUnifiedTopology: true})
/*
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect("mongodb+srv://AmPAHASS:allsheltersplease@testingcluster.g0jphxj.mongodb.net/BudgetCalculator", {useNewUrlParser: true}, {useUnifiedTopology: true});
}*/

const hostname = '0.0.0.0';
const port = 3000;

//create schema - legacy from budget calc
const resultSchema = {
    Shelter: String,
    CurrentBudget: Number,
    Zipcode : String,
    TypeOfShelter : String
}

const Result = mongoose.model("Result", resultSchema);

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
})

// post legacy from budget calc 
app.post("/", function(req, res) {
    let newResult = new Result ({
        Shelter: req.body.input_name,
        CurrentBudget: req.body.input_budget,
        Zipcode : req.body.input_Zipcode,
        TypeOfShelter : req.body.input_ShelterType,
    });
    newResult.save();
    //tools.catBoardingCosts();
    //res.redirect("/"); //refresh page
    res.send("Data Successfully Posted! Please click the back button to see your results.");
})

app.listen(port, hostname, () => {
    console.log('server is running at http://', hostname, ':', port);
});