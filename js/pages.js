const pageChange = () => {
    if (location.hash == "#console") {
        // div display
        document.getElementById('topPage').style.display ="none";
        document.getElementById('consolePage').style.display ="block";
        document.getElementById('plotgraphPage').style.display ="none";
        // header tab active
        document.getElementById('consoleTab').classList.add("active")
        document.getElementById('plotgraphTab').classList.remove("active")
    }　else if (location.hash == "#plotgraph") {
        // div display
        document.getElementById('topPage').style.display ="none";
        document.getElementById('consolePage').style.display ="none";
        document.getElementById('plotgraphPage').style.display ="block";
        // header tab active
        document.getElementById('consoleTab').classList.remove("active")
        document.getElementById('plotgraphTab').classList.add("active")
    } else {
        // div display
        document.getElementById('topPage').style.display ="block";
        document.getElementById('consolePage').style.display ="none";
        document.getElementById('plotgraphPage').style.display ="none";
        // header tab active
        document.getElementById('consoleTab').classList.remove("active")
        document.getElementById('plotgraphTab').classList.remove("active")
    }
}

window.addEventListener('hashchange', ()=>{
    pageChange()
}, false);

// for load jsfile
pageChange()