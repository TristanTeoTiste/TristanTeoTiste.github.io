document.addEventListener("DOMContentLoaded", function(){
  const page = document.body.dataset.page;
  console.log("Page détectée:", page);

  // Helpers
  function euro(n){ return (n||0).toLocaleString("fr-FR",{style:"currency",currency:"EUR"}); }
  function pct(x){ return isFinite(x)?(x*100).toFixed(2)+"%":"—"; }

  // Fonction de variation simulée (pour actions)
  function mockVariation(){ return (Math.random() * 10 - 5) / 100; }

  // Fonction de prix simulé (pour actions/crypto démo)
  function mockPrice(symbol){
    let h=0; for(let i=0;i<symbol.length;i++){ h = (h*31 + symbol.charCodeAt(i))>>>0; }
    const t = Date.now()/3600000;
    return 100*(1+0.1*Math.sin(t+(h%10)))+(h%7);
  }

  // ---------------- HOME ----------------
  if(page === "home"){
    const ctx = document.getElementById("chart");
    const total = 9500;

  // Plugin pour écrire au centre
  const centerText = {
    id: 'centerText',
    beforeDraw(chart, args, options) {
      const { ctx, chartArea: {width, height} } = chart;
      ctx.save();
      ctx.font = "bold 80px Arial";
      ctx.fillStyle = "white"; // couleur texte
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Total  " + total.toLocaleString("fr-FR") + " €", width / 2, height / 2);
    }
  };

    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Actions", "Crypto", "Obligations", "Livrets"],
        datasets: [{
          data: [5000, 2000, 1500, 1000],
          backgroundColor: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"]
        }]
      },
      options: {
      plugins: { legend: { position: "bottom" } }
    },
    plugins: [centerText]
    });
    document.getElementById("total").textContent = "€9 500";
  }

  // ---------------- ACTIONS ----------------
  if(page === "actions"){
    const list = [];
    const rows = document.getElementById("actions-rows");
    const totalEl = document.getElementById("actions-total");

    function render(){
      if(!list.length){
        rows.innerHTML = '<tr><td colspan="6">Aucune ligne</td></tr>';
        totalEl.textContent = "—";
        return;
      }

      let html = "", total = 0;
      let labels = [], values = [];

      list.forEach(function(it){
        const price = mockPrice(it.symbol);
        const value = price * it.quantity;
        const varPct = mockVariation();
        const arrow = varPct >= 0 
          ? '<span class="up">▲ ' + (varPct*100).toFixed(2) + '%</span>'
          : '<span class="down">▼ ' + (varPct*100).toFixed(2) + '%</span>';

        total += value;
        labels.push(it.name);
        values.push(value);

        html += "<tr>"+
          "<td>"+it.name+"</td>"+
          "<td>"+it.symbol+"</td>"+
          "<td>"+it.quantity+"</td>"+
          "<td>"+arrow+"</td>"+
          "<td>"+euro(price)+"</td>"+
          "<td>"+euro(value)+"</td>"+
        "</tr>";
      });

      rows.innerHTML = html;
      totalEl.textContent = euro(total);

      // Camembert
      const pieCanvas = document.getElementById("actions-pie");
      if(pieCanvas){
        if(window.pieChart) window.pieChart.destroy();
        window.pieChart = new Chart(pieCanvas, {
          type: "doughnut",
          data: { labels: labels, datasets:[{ data: values, backgroundColor: ["#4f46e5","#10b981","#f59e0b","#ef4444","#06b6d4"] }] },
          options: { plugins:{ legend:{ position:"bottom" } } }
        });
      }

      // Graphique linéaire simulé
      const lineCanvas = document.getElementById("actions-line");
      if(lineCanvas){
        if(window.lineChart) window.lineChart.destroy();
        let historyLabels = [], historyValues = [];
        let base = total, now = Date.now();
        for(let i=29;i>=0;i--){
          historyLabels.push(new Date(now - i*86400000).toLocaleDateString("fr-FR"));
          let fluctuation = base * (1 + (Math.random()-0.5)*0.1);
          historyValues.push(fluctuation.toFixed(2));
        }
        window.lineChart = new Chart(lineCanvas, {
          type: "line",
          data: { labels: historyLabels, datasets:[{ label:"Valeur totale", data: historyValues, borderColor:"#4f46e5", backgroundColor:"rgba(79,70,229,0.3)", fill:true, tension:0.2 }] },
          options: { plugins:{ legend:{ display:false }}, scales:{ y:{ ticks:{ callback:v=>euro(v) } } } }
        });
      }
    }

    document.getElementById("form-actions").addEventListener("submit", function(e){
      e.preventDefault();
      const f = new FormData(e.target);
      list.push({
        name: f.get("name"),
        symbol: f.get("symbol"),
        quantity: parseFloat(f.get("quantity"))
      });
      e.target.reset();
      render();
    });

    render();
  }

  // ---------------- OBLIGATIONS ----------------
  if(page === "obligations"){
    const list = [];
    const rows = document.getElementById("obligations-rows");
    const totalEl = document.getElementById("obligations-total");

    function currentValueObligation(principal, annualRate, startDate){
      const start = new Date(startDate).getTime();
      const now = Date.now();
      const years = (now - start) / (1000*60*60*24*365);
      return principal * (1 + annualRate/100 * years);
    }

    function render(){
      if(!list.length){
        rows.innerHTML = '<tr><td colspan="4">Aucune ligne</td></tr>';
        totalEl.textContent = "—";
        return;
      }

      let html = "", total = 0;
      let labels = [], values = [];

      list.forEach(function(it){
        const value = currentValueObligation(it.principal, it.annualRate, it.startDate);
        total += value;
        labels.push(it.name);
        values.push(value);

        html += "<tr>"+
          "<td>"+it.name+"</td>"+
          "<td>"+euro(it.principal)+"</td>"+
          "<td>"+it.annualRate+"%</td>"+
          "<td>"+euro(value)+"</td>"+
        "</tr>";
      });

      rows.innerHTML = html;
      totalEl.textContent = euro(total);

      // Camembert
      const pieCanvas = document.getElementById("obligations-pie");
      if(pieCanvas){
        if(window.obligPie) window.obligPie.destroy();
        window.obligPie = new Chart(pieCanvas, {
          type: "doughnut",
          data: { labels: labels, datasets:[{ data: values, backgroundColor: ["#4f46e5","#10b981","#f59e0b","#ef4444"] }] },
          options: { plugins:{ legend:{ position:"bottom" } } }
        });
      }

      // Graphique linéaire simulé
      const lineCanvas = document.getElementById("obligations-line");
      if(lineCanvas){
        if(window.obligLine) window.obligLine.destroy();
        let historyLabels = [], historyValues = [];
        let base = total, now = Date.now();
        for(let i=29;i>=0;i--){
          historyLabels.push(new Date(now - i*86400000).toLocaleDateString("fr-FR"));
          let fluctuation = base * (1 + (Math.random()-0.5)*0.05);
          historyValues.push(fluctuation.toFixed(2));
        }
        window.obligLine = new Chart(lineCanvas, {
          type: "line",
          data: { labels: historyLabels, datasets:[{ label:"Valeur totale", data: historyValues, borderColor:"#10b981", backgroundColor:"rgba(16,185,129,0.3)", fill:true, tension:0.2 }] },
          options: { plugins:{ legend:{ display:false }}, scales:{ y:{ ticks:{ callback:v=>euro(v) } } } }
        });
      }
    }

    document.getElementById("form-obligations").addEventListener("submit", function(e){
      e.preventDefault();
      const f = new FormData(e.target);
      list.push({
        name: f.get("name"),
        principal: parseFloat(f.get("principal")),
        annualRate: parseFloat(f.get("annualRate")),
        startDate: f.get("startDate")
      });
      e.target.reset();
      render();
    });

    render();
  }

});
