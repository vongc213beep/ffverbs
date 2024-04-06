async function loadData(){
    let resp = await fetch('data.json');  
    let dataset = await resp.json(); 
    return dataset;
}

function buildOption(group, id, name){
    let opt = document.createElement("option"); 
    opt.id = group + "$" + id; 
    opt.innerText = name; 
    return opt;
}

function initForm(dataset){
    const verbsList = dataset.verbs; 
    const selectElem = document.querySelector("#selectVerb"); 
    selectElem.innerHTML = ""; 
    for (let i = 0; i < verbsList.length; i++){
        const verb = verbsList[i]; 
        selectElem.appendChild(
            buildOption(
                "verb", 
                String(i), 
                verb.name
            )
        );
    }
}

function buildVerbTable(dataset, verbInd){
    let verbData = dataset.verbs[verbInd]; 
    if (verbData == null) return; 
    
    let vName = verbData.name; 
    let vTranslate = verbData.translate; 
    verbNameFN.innerText = `Verb Name: ${vName}`; 
    verbNameEN.innerText = `Meaning: ${vTranslate}`; 
    
    verbData = verbData.forms.present; 
    let tblModel = new VerbModel(verbData, selectDiff.selectedIndex); 
    tablecontainer.innerHTML = "";
    tablecontainer.appendChild(tblModel.buildTable());
}


function checkIfAnswers(d, ind){
    let feedback = ""; 

    let allAnswers = document.querySelectorAll(".answer");
    for (let i = 0; i < allAnswers.length; i++){
        let selVal = allAnswers[i].value; 
        let prn = d.verbs[ind].forms.present.keys[i];
        let actVal = d.verbs[ind].forms.present[prn]; 

        if (selVal != actVal){
            feedback += `The correct conjucate for "${prn}" should be "${actVal}" not "${selVal}"\n`;
        }
    }


    return feedback; 
}

function areAnswersValid(){
    let allAnswers = document.querySelectorAll(".answer");
    for (let i = 0; i < allAnswers.length; i++){
        let selVal = allAnswers[i].value; 
        if (selVal == "") return false;
    }
    return true; 
}

async function performAction(event){
    const id = event.currentTarget.id; 
    if (id == "selectVerb" || id == "selectDiff"){
        checkBtn.disabled = true; 
        let d = await loadData(); 
        buildVerbTable(d, document.getElementById("selectVerb").selectedIndex); 
        checkBtn.disabled = false;
    }else if(id == "checkBtn"){
        if (!areAnswersValid()){
            await Swal.fire({
                title: `Check your Answers!`,
                text: "Please fill in all answers!",
                icon: 'warning',
                confirmButtonText: 'Ok!'
            }); 
            return; 
        }
        let d = await loadData(); 
        let ind =  document.getElementById("selectVerb").selectedIndex;
        
        let feedback = checkIfAnswers(d, ind); 
        if (feedback == ''){
            await Swal.fire({
                title: `You learnt the verb ${d.verbs[ind].name}!`,
                text: "Now you move onward",
                icon: 'success',
                confirmButtonText: 'On-Ward!'
            }); 
            document.getElementById("selectVerb").selectedIndex = ((ind + 1) % d.verbs.length);  
            buildVerbTable(d, document.getElementById("selectVerb").selectedIndex); 
        }else{
            Swal.fire({
                title: 'You have mistakes!',
                text: feedback,
                icon: 'error',
                confirmButtonText: 'Try again!'
            })
        }
    }
}


/*
    Verb Model 
*/
class VerbModel{

    static C_EASY = 0; 
    static C_MID  = 1; 
    static C_HARD = 2;

    rowSize = 0; 
    colSize = 0;
    dataset = {}; 
    diff    = VerbModel.C_EASY;

    static I_PR   = 0; 
    static I_CN   = 1; 
    static I_COLS = 2; 
    static COLS = ["Pronoun", "Verb"];

    constructor(data, diff){
        this.rowSize = data.keys.length;  
        this.colSize = VerbModel.I_COLS; 
        this.dataset = Object.assign({}, data);
        console.log(this.dataset);
        this.diff = diff;
    }

    getColSize(){
        return this.colSize; 
    }

    getRowSize(){
        return this.rowSize;
    }

    _wrapInLabel(str){
        return "<label>" + str + "</label>";
    }

    getValueAt(row, col){
        if (row == -1){
            return VerbModel.COLS[col]; 
        }else{
            const key = this.dataset.keys[row];
            switch(col){
                case VerbModel.I_PR:{
                    return this._wrapInLabel(key);
                }
                case VerbModel.I_CN:{
                    return `<div id='r,${row},${col}'>${this.getComponentBasedOnDiff()}</div>`;
                }
            }
            return null;
        }
    }

    shuffle(array) {
        let currentIndex = array.length;
      
        // While there remain elements to shuffle...
        while (currentIndex != 0) {
      
          // Pick a remaining element...
          let randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      }
      

    getCompForEasyDiff(){
        let comp = "<select class='form-control answer'>"; 
        
        let arr = Object.assign([], this.dataset.keys); 
        this.shuffle(arr);

        for (let i = 0; i < arr.length; i++){
            let key = arr[i]; 
            comp += `<option>${this.dataset[key]}</option>`;
        }

        comp += "</select>"; 

        return comp; 
    }

    getCompForMidDiff(){
        /**todo */
        if ((Math.random() * 100) <= 50){
            return this.getCompForEasyDiff();
        }else{
            return this.getCompForHardDiff(); 
        }
    }

    getCompForHardDiff(){
        /**todo */
        return "<input type='text' class='form-control answer' />";
    }

    getComponentBasedOnDiff(){
        switch(this.diff){
            case VerbModel.C_EASY:{
                return this.getCompForEasyDiff();
            }
            case VerbModel.C_MID:{
                return this.getCompForMidDiff(); 
            }
            case VerbModel.C_HARD:{
                return this.getCompForHardDiff(); 
            }
        }
        return "";
    }

    buildTable(){
        return buildTableModel(this, "thead-dark"); 
    }

}

function buildTableModel(tableModel, theadClass){
    const tbl = document.createElement("table"); 
    tbl.classList.add("table");
    tbl.classList.add("table-bordered"); 
    tbl.classList.add("table-hover");

    const tblHead = document.createElement("thead"); 
    tblHead.classList.add(theadClass); 
    

    const headerRow = document.createElement("tr"); 
    for (let i = 0; i < tableModel.getColSize(); i++){
        const th = document.createElement("th"); 
        th.setAttribute("scope", "col"); 
        th.innerHTML = tableModel.getValueAt(-1, i);
        headerRow.appendChild(th);  
    }
    tblHead.appendChild(headerRow); 
    tbl.appendChild(tblHead); 

    const tblBody = document.createElement("tbody"); 
    for (let i = 0; i < tableModel.getRowSize(); i++){
        const tr = document.createElement("tr"); 
        for (let j = 0; j < tableModel.getColSize(); j++){
            const td = document.createElement("td"); 
            td.innerHTML = tableModel.getValueAt(i, j); 
            tr.appendChild(td); 
        }
        tblBody.appendChild(tr); 
    }
    tbl.appendChild(tblBody); 
    return tbl; 
}