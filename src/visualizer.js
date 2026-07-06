import { Network } from 'vis-network/standalone';

export class ConsensusVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.network = null;
    this.interval = null;
    this.currentStep = 0;
    this.steps = [];
    
    this.options = {
      nodes: {
        shape: 'dot',
        size: 20,
        font: { size: 12, color: '#ffffff', face: 'Space Grotesk', bold: { color: '#ffffff' } },
        borderWidth: 2,
        color: {
          border: 'rgba(255, 255, 255, 0.2)',
          background: 'rgba(15, 15, 20, 0.8)',
          highlight: { border: '#00f0ff', background: 'rgba(0, 240, 255, 0.2)' }
        },
        shadow: { enabled: true, color: 'rgba(0, 0, 0, 0.8)', size: 15 }
      },
      edges: {
        width: 1.5,
        color: { color: 'rgba(255, 255, 255, 0.1)', highlight: '#00f0ff' },
        smooth: { type: 'continuous' },
        arrows: { to: { scaleFactor: 0.5 } }
      },
      physics: {
        enabled: true,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: { gravitationalConstant: -60, centralGravity: 0.015, springLength: 100, springConstant: 0.05 }
      },
      interaction: { dragNodes: true, zoomView: false, hover: true }
    };
  }

  load(steps) {
    this.stop();
    this.steps = steps;
    this.currentStep = 0;
    this.renderStep();
    this.interval = setInterval(() => {
      this.currentStep = (this.currentStep + 1) % this.steps.length;
      this.renderStep();
    }, 4000); // 4 seconds per phase
  }

  goToStep(index) {
    this.currentStep = index;
    if(this.interval) clearInterval(this.interval);
    this.renderStep();
    // Restart interval
    this.interval = setInterval(() => {
      this.currentStep = (this.currentStep + 1) % this.steps.length;
      this.renderStep();
    }, 4000);
  }

  renderStep() {
    const stepData = this.steps[this.currentStep];
    if (!stepData || !stepData.graph) return;

    if (!this.network) {
      this.network = new Network(this.container, stepData.graph, this.options);
    } else {
      this.network.setData(stepData.graph);
    }

    // Highlight the active step in the UI list
    document.querySelectorAll('.step-item').forEach((li, idx) => {
      if (idx === this.currentStep) {
        li.classList.add('active-step');
        // Scroll into view if needed
        li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        li.classList.remove('active-step');
      }
    });
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
    if (this.network) {
      this.network.destroy();
      this.network = null;
    }
  }
}
