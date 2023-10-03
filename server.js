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

// Read the JSON file with state and county data
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'counties_list.json')));
const data_svi = JSON.parse(fs.readFileSync(path.join(__dirname, 'svi_county_2020.json')));

// code to make it possible to make a request for the counties when a state is chosen
app.get('/counties/:state', (req, res) => {
  const state = req.params.state;
  const counties = data.filter(entry => entry.State === state).map(entry => entry.County);
  res.json(counties);
});

// code to make it possible to make a request for the counties when a state is chosen
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

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect("mongodb+srv://AmPAHASS:allsheltersplease@testingcluster.g0jphxj.mongodb.net/BudgetCalculator", {useNewUrlParser: true}, {useUnifiedTopology: true});
}

const hostname = '0.0.0.0';
const port = 3000;

//create schema
const resultSchema = {
    Shelter: String,
    CurrentBudget: Number,
    Zipcode : String,
    TypeOfShelter : String
    /*LastYearsIntake : Number,
    MinimumWage : Number,
    VetTransactionsPerPet : Number,
    OpCostsVetPerTransaction : Number,
    PctFosterDogsNeedingKennels : Number,
    DogKennelsOnsite : Number,
    DogKennelOccupancyRate : Number,
    DogIntakeDischargeTime : Number,
    PctBehaviorDogsKennels : Number,
    AvgLOSNonBehaviorDogs : Number,
    DogsNeedingKennels : Number,
    OpCostsPerDogTotalLOS : Number,
    DailyCostsPerDog : Number,
    DogsOnsitePerDay : Number,
    BehaviorDogKennels : Number,
    PctFosterCatsNeedingKennels : Number,
    CatCapacityOnsite : Number,
    CatsNeedingKennels : Number,
    OpCostsPerCatTotalLOS : Number,
    DailyCostsPerCat : Number,
    CallsPerYear : Number,
    TimePerCall : Number,
    OpCostsPerCall : Number,
    PctBehaviorDogs : Number,
    BehaviorDogsPerYear : Number,
    OpCostsPerBehaviorDog : Number,
    AvgLOSBehaviorDogs : Number,
    AvgCloseRateInPerson : Number,
    ExpectedLRR : Number,
    CatRTFPct : Number,
    RTOGoalPct : Number,
    OnsiteVisitorsNeeded : Number,
    ExpectedLRNumber : Number,
    AdoptionsPerYearOnsite : Number,
    OpCostsPerOnsiteAdoption : Number,
    VirtualAdoptionsPerYear : Number,
    OpCostsPerVirtualAdoption : Number,
    YearlyRTFCats : Number,
    OpCostsPerRTFCat : Number,
    YearlyRTO : Number,
    OpCostsPerRTO : Number,
    DeadOutcomesPerYear : Number,
    PctPlacedInFoster : Number,
    OpCostsPerFoster : Number,
    PctCallsRespondedToInperson : Number,
    HoursPerResponse : Number,
    FieldServiceCallsPerYear : Number,
    OpCostsPerCallResponse : Number,
    FixedCostsPct : Number,
    EmployeeBurdenPct : Number,
    EmployeeDailyWorkHours : Number,
    EmployeeEfficiency : Number,
    WeeklyHoursWorked : Number,
    MarketingCostsPerIntake : Number,
    TotalIntake: Number,
    DogIntake : Number,
    CatIntake : Number,
    HumanPop : Number,
    StrayCats : Number,
    StrayDogs : Number,
    BehaviorDogs : Number,
    PctInFoster : Number,
    VetServiceCosts : Number,
    DogBoardingCosts : Number,
    CatBoardingCosts : Number,
    CallCenterCosts : Number,
    BehaviorDogCosts : Number,
    PlacementCosts : Number,
    FosterCosts : Number,
    FieldServiceCosts : Number,
    MarketingCosts : Number,
    Overhead : Number,
    TotalAnnualBudget : Number*/
}

const Result = mongoose.model("Result", resultSchema);

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
})

app.post("/", function(req, res) {
    let newResult = new Result ({
        Shelter: req.body.input_name,
        CurrentBudget: req.body.input_budget,
        Zipcode : req.body.input_Zipcode,
        TypeOfShelter : req.body.input_ShelterType,
        /*LastYearsIntake : req.body.input_LastYearsIntake,
        MinimumWage : req.body.input_MinWage,
        VetTransactionsPerPet : req.body.input_VetTransactions,
        OpCostsVetPerTransaction : req.body.input_VetCosts,
        PctFosterDogsNeedingKennels : req.body.input_PctFosterDogsKennels,
        DogKennelsOnsite : req.body.input_DogKennelsOnsite,
        DogKennelOccupancyRate : req.body.input_DogKennelOccupancy,
        DogIntakeDischargeTime : req.body.input_DogIntakeTime,
        PctBehaviorDogsKennels : req.body.input_BehaviorDogKennelsPct,
        AvgLOSNonBehaviorDogs : req.body.input_AvgLOSNormalDogs,
        DogsNeedingKennels : req.body.output_DogKennels,
        OpCostsPerDogTotalLOS : req.body.output_DogOpCostsBoarding,
        DailyCostsPerDog : req.body.output_DailyDogCosts,
        DogsOnsitePerDay : req.body.output_DailyDogsOnsite,
        BehaviorDogKennels : req.body.output_BehaviorDogKennels,
        PctFosterCatsNeedingKennels : req.body.input_PctFosterCatKennels,
        CatCapacityOnsite : req.body.input_CatOnsiteIdealCapacity,
        CatsNeedingKennels : req.body.output_CatKennels,
        OpCostsPerCatTotalLOS : req.body.output_CatBoardingOpCosts,
        DailyCostsPerCat : req.body.output_DailyCostPerCat,
        CallsPerYear : req.body.input_CallsPerYear,
        TimePerCall : req.body.input_TimePerCall,
        OpCostsPerCall : req.body.output_OpCostPerCall,
        PctBehaviorDogs : req.body.input_PctBehaviorDogs,
        BehaviorDogsPerYear : req.body.output_BehaviorDogsPerYear,
        OpCostsPerBehaviorDog : req.body.output_OpCostPerBehaviorDog,
        AvgLOSBehaviorDogs : req.body.output_AvgLOSBehaviorDogs,
        AvgCloseRateInPerson : req.body.input_AvgCloseRateInPerson,
        ExpectedLRR : req.body.input_ExpectedLRR,
        CatRTFPct : req.body.input_CatRTFPct,
        RTOGoalPct : req.body.input_RTOGoalPct,
        OnsiteVisitorsNeeded : req.body.output_VisitorsPerYearOnsite,
        ExpectedLRNumber : req.body.output_ExpectedLRRNumber,
        AdoptionsPerYearOnsite : req.body.output_AdoptionsPerYearOnsite,
        OpCostsPerOnsiteAdoption : req.body.output_OpCostPerAdoptionOnsite,
        VirtualAdoptionsPerYear : req.body.output_YearlyVirtualAdoptions,
        OpCostsPerVirtualAdoption : req.body.output_OpCostPerAdoptionVirtual,
        YearlyRTFCats : req.body.output_RTFCatsPerYear,
        OpCostsPerRTFCat : req.body.output_OpCostPerRTFCat,
        YearlyRTO : req.body.output_RTOPerYearShelter,
        OpCostsPerRTO : req.body.output_OpCostPerRTOShelter,
        DeadOutcomesPerYear : req.body.output_YearlyDeadOutcomes,
        PctPlacedInFoster : req.body.input_PctInFoster,
        OpCostsPerFoster : req.body.output_OpCostPerFoster,
        PctCallsRespondedToInperson : req.body.input_PctInPersonResponses,
        HoursPerResponse : req.body.input_FieldOfficerHoursPerResponse,
        FieldServiceCallsPerYear : req.body.output_YearlyFieldServiceCalls,
        OpCostsPerCallResponse : req.body.output_OpCostPerResponse,
        FixedCostsPct : req.body.input_FixedCostsPctOther,
        EmployeeBurdenPct : req.body.input_PctEmployeeBurden,
        EmployeeDailyWorkHours : req.body.input_DailyEmployeeWorkHours,
        EmployeeEfficiency : req.body.input_EmployeeEfficiency,
        WeeklyHoursWorked : req.body.input_WeeklyHoursWorked,
        MarketingCostsPerIntake : req.body.output_MarketingCostPerIntake,
        TotalIntake: req.body.input_PetIntake,
        DogIntake : req.body.input_DogIntake,
        CatIntake : req.body.input_CatIntake,
        HumanPop : req.body.input_HumanPop,
        StrayCats : req.body.output_StrayCats,
        StrayDogs : req.body.output_StrayDogs,
        BehaviorDogs : req.body.output_BehaviorDogsPerYear,
        PctInFoster : req.body.input_PctInFoster,
        VetServiceCosts : req.body.output_OpCostsVetServices,
        DogBoardingCosts : req.body.output_OpCostsDogBoarding,
        CatBoardingCosts : req.body.output_OpCostsCatBoarding,
        CallCenterCosts : req.body.output_OpCostsCallCenter,
        BehaviorDogCosts : req.body.output_OpCostsBehaviorDogs,
        PlacementCosts : req.body.output_OpCostsPlacement,
        FosterCosts : req.body.output_OpCostsFoster,
        FieldServiceCosts : req.body.output_OpCostsFieldServices,
        MarketingCosts : req.body.output_OpCostsMarketing,
        Overhead : req.body.output_Overhead,
        TotalAnnualBudget : req.body.output_TotalAnnualBudget*/
    });
    newResult.save();
    //tools.catBoardingCosts();
    //res.redirect("/"); //refresh page
    res.send("Data Successfully Posted! Please click the back button to see your results.");
})

//app.listen(3000, function() {
    //console.log("server is running on 3000");
//})

app.listen(port, hostname, () => {
    console.log('server is running at http://', hostname, ':', port);
});