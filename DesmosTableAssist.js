// ==UserScript==
// @name        DesmosTableAssist
// @author      ronwnor
// @version     1.0
// @description create and manipulate point tables easier!
// @match       https://*.desmos.com/calculator*
// @grant       none
// ==/UserScript==

(function() {
    'use strict';

    //tracks corrected mouse pos 
    var pos = Calc.pixelsToMath({x: 0, y: 0});
    document.addEventListener('mousemove', function(evt) {
        pos = Calc.pixelsToMath({
            x: evt.clientX,
            y: evt.clientY - 46
        })
    })
    //alt+Q; creates a new, draggable 2D table  
    function onAltQ() {
        var table_var = 0
        if (Calc.getExpressions().filter(x=>x.type=='table').length != 0){ 
            table_var = Math.max(...Calc.getExpressions().filter(x=>x.type=='table').map(x=>((x.columns)[0]||'').latex).map(x=>(x.match(`x_{([0-9]+)}`)||'')[1]).filter(Boolean)) + 1
        }
        Calc.setExpression({
            type: 'table',
            columns: [{ latex: 'x_{' + table_var.toString() + '}', values: [pos.x.toFixed(3).toString()] },
                      { latex: 'y_{' + table_var.toString() + '}', values: [pos.y.toFixed(3).toString()],
                    dragMode: Desmos.DragModes.XY }]
        });
    }

    //alt+A; adds a point in the selected/last created table
    function onAltA() {
        // get table id (string: '8')
        var table_id = ''
        var table_length = 0
        if(Calc.getExpressions().filter(x=>x.id == Calc.selectedExpressionId)[0] != undefined){
            if(Calc.getExpressions().filter(x=>x.id == Calc.selectedExpressionId)[0].type == 'table'){
                table_id = Calc.selectedExpressionId
            }
        }
        else{
            table_id = Calc.getExpressions().filter(x=>x.type == 'table').map(x=>x.id).at(-1)
        }

        //gets table length (num: 8)
        table_length = Calc.getExpressions().filter(x=>x.id == table_id)[0].columns[0].values.length

        //adds pos.x to column[0]
        Calc.controller.dispatcher.dispatch({
            "type": "set-tablecell-latex",
            "tableId": table_id,
            "cell": {
                "row": table_length + 1,
                "column": 0,
            },
            "latex": pos.x.toFixed(3).toString()
        })
        //adds pos.y to column[1]
        Calc.controller.dispatcher.dispatch({
            "type": "set-tablecell-latex",
            "tableId": table_id,
            "cell": {
                "row": table_length + 1,
                "column": 1,
            },
            "latex": pos.y.toFixed(3).toString()
        })
    }

    function onKeydown(evt) {
        if (evt.altKey && evt.keyCode == 81) {
            onAltQ();
        }
        else if (evt.altKey && evt.keyCode == 65) {
            onAltA();
        } 
    }
    document.addEventListener('keydown', onKeydown, true);
})();
