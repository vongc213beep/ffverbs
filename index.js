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
    verbData = verbData.forms.present; 
    let tblModel = new VerbModel(verbData, selectDiff.selectedIndex); 
    tablecontainer.innerHTML = "";
    tablecontainer.appendChild(tblModel.buildTable());
}


async function performAction(event){
    const id = event.currentTarget.id; 
    if (id == "selectVerb"){
        let d = await loadData(); 
        buildVerbTable(d, document.getElementById("selectVerb").selectedIndex); 
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

    getCompForEasyDiff(){
        let comp = "<select class='form-control'>"; 
        
        for (let i = 0; i < this.dataset.keys.length; i++){
            let key = this.dataset.keys[i]; 
            comp += `<option>${this.dataset[key]}</option>`;
        }

        comp += "</select>"; 

        return comp; 
    }

    getCompForMidDiff(){
        /**todo */
        return ""; 
    }

    getCompForHardDiff(){
        /**todo */
        return "";
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