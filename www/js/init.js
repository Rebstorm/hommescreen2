var AppInit = function(){
    
    function init(){
        setTheming();
        setUniversalHandlers();
        getAvailableApps();
        getAvailableNotes();
    }


    function getAvailableApps(){
        Apps.getAllApps();
    }

    function getAvailableNotes(){
        Notes.init();
        Notes.getAllNotes();
    }

    function setTheming(){
        //get theming from file. 
                    // This is the temp one for testing.
        var theme = ThemeRepo.dark;

        // body
        document.body.style.backgroundColor = theme.shadeColor;
        document.body.style.color = theme.textColor;

        /* MAIN WINDOW*/
        // titlescreen/weather-bar
        document.getElementById("title-screen").style.backgroundColor = theme.mainColor;
        //main-popup window
        document.getElementById("main-popup").style.backgroundColor = theme.shadeColor;
        // button style
        HelpFunctions.changeCSSClass("div.app-icon-button", "backgroundColor", theme.altColor);
        

        /* HUE WINDOW */
        //hue detail window
        document.getElementById("hue-color-popup").style.backgroundColor = theme.shadeColor;


        /* UHOH WINDOW */
        HelpFunctions.changeCSSClass("div#uhoh", "backgroundColor", theme.shadeColor);
     
        
        /* NOTES WINDOW */

        //Input@Notes-title
        HelpFunctions.changeCSSClass("input#main-note-title-input", "backgroundColor", theme.attributionColor);
        //textarea@Notes-description
        HelpFunctions.changeCSSClass("textarea.main-notes-description-area", "backgroundColor", theme.attributionColor);
        
    }

    function setUniversalHandlers(){

        // Keeps apps awake, cant sleep.
        window.plugins.insomnia.keepAwake();

        // exit button on popup screen
        document.getElementById("main-popup-exit").addEventListener("click", function(){
           document.getElementById("main-popup").className = "main-popup-out";
           if(document.getElementById("main-popup-content")){
               document.getElementById("main-popup").removeChild(document.getElementById("main-popup-content"));
           }
           document.getElementById("main-popup").style.display = "none";

        });


        window.addEventListener("resize", function(event){
           if(window.outerWidth < 379){
               document.getElementById("uhoh").style.display = "block";
               document.getElementById("app").style.display = "none";
               // hide main-popup
               //document.getElementById("main-popup").style.display = "none";
           } else {
               document.getElementById("uhoh").style.display = "none";
               document.getElementById("app").style.display = "block";
           }


        });
        
    }

    function startNewActivity(){
        document.getElementById("main-popup").style.display = "block";
        document.getElementById("main-popup").className = "main-popup-in";
    }

    function killActivity(){

       document.getElementById("main-popup").className = "main-popup-out";
       if(document.getElementById("main-popup-content")){
           document.getElementById("main-popup").removeChild(document.getElementById("main-popup-content"));
       }
       document.getElementById("main-popup").style.display = "none";

    }

    function showErrorBox(msg){
        var popup = document.getElementById("error-box");
        var text = document.getElementById("error-box-text");
        popup.className = "fade-in";
        popup.style.display = "block";
        text.innerHTML = msg;

        setTimeout(function(){
            popup.className = "fade-out";
            setTimeout(function(){
                popup.style.display = "none";
            }, 900);

        }, 6000);

    }


    return {
        init: init,
        startNewActivity : startNewActivity,
        killActivity : killActivity,
        showErrorBox : showErrorBox
    }

}();

