/* Berserk API v1 browser adapter. */
(function () {
  "use strict";
  var script = document.currentScript;
  var apiBase = script && script.src ? new URL("/api/v1", script.src).origin + "/api/v1" : "https://berserk/api/v1";
  function BerserkEngine(options) {
    options = options || {};
    this.onStatus = typeof options.onStatus === "function" ? options.onStatus : function () {};
    this.onInfo = typeof options.onInfo === "function" ? options.onInfo : function () {};
    this.onError = typeof options.onError === "function" ? options.onError : function () {};
    this.stopped = false;
    var self = this;
    this.onStatus("loading");
    this.ready = fetch(apiBase + "/health", {cache:"no-store", credentials:"omit"})
      .then(function (r) { if (!r.ok) throw new Error("Berserk API health check failed (HTTP " + r.status + ")."); return r.json(); })
      .then(function (data) { if (data.status !== "ok") throw new Error("Berserk API is not healthy."); self.onStatus("ready"); return self; })
      .catch(function (err) { self.onStatus("error"); self.onError(err); throw err; });
  }
  BerserkEngine.prototype.search = async function (fen, milliseconds, multiPV, context) {
    await this.ready;
    if (this.stopped) throw new Error("Berserk API client has been stopped.");
    var response = await fetch(apiBase + "/analyze", {method:"POST", mode:"cors", credentials:"omit", cache:"no-store", headers:{"Content-Type":"application/json"}, body:JSON.stringify({fen:String(fen), think_time_ms:Math.max(100,Math.min(10000,Math.round(Number(milliseconds)||1000))), multi_pv:Math.max(1,Math.min(8,Math.round(Number(multiPV)||1))), threads:1, context:context === undefined ? null : context})});
    var result = {}; try { result = await response.json(); } catch (_) {}
    if (!response.ok) throw new Error(result.detail || ("Berserk API search failed (HTTP " + response.status + ")."));
    if (!result.bestmove) throw new Error("Berserk API returned no best move.");
    return result;
  };
  BerserkEngine.prototype.terminate = function () { this.stopped = true; };
  window.BerserkEngine = BerserkEngine;
})();