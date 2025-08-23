// Simple chart fallback when Chart.js unavailable
class SimpleChart {
    constructor(ctx, config) {
        this.canvas = ctx.canvas || ctx;
        this.config = config;
        this.ctx = this.canvas.getContext('2d');
        this.render();
    }

    render() {
        const { data, type } = this.config;
        
        if (type === 'bar') {
            this.renderBarChart(data);
        } else if (type === 'line') {
            this.renderLineChart(data);
        } else if (type === 'pie' || type === 'doughnut') {
            this.renderPieChart(data);
        }
    }

    renderBarChart(data) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const padding = 40;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const values = data.datasets[0].data;
        const labels = data.labels;
        const maxValue = Math.max(...values);
        const barWidth = chartWidth / labels.length * 0.8;
        const barSpacing = chartWidth / labels.length * 0.2;
        
        // Draw bars
        values.forEach((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = padding + index * (barWidth + barSpacing);
            const y = canvas.height - padding - barHeight;
            
            ctx.fillStyle = data.datasets[0].backgroundColor[index] || '#3498db';
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Draw labels
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(labels[index], x + barWidth/2, canvas.height - 10);
            ctx.fillText(value, x + barWidth/2, y - 5);
        });
    }

    renderLineChart(data) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const padding = 40;
        const chartWidth = canvas.width - padding * 2;
        const chartHeight = canvas.height - padding * 2;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const values = data.datasets[0].data;
        const labels = data.labels;
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const valueRange = maxValue - minValue;
        
        ctx.strokeStyle = data.datasets[0].borderColor || '#3498db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        values.forEach((value, index) => {
            const x = padding + (index / (values.length - 1)) * chartWidth;
            const y = padding + ((maxValue - value) / valueRange) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
    }

    renderPieChart(data) {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const values = data.datasets[0].data;
        const total = values.reduce((sum, val) => sum + val, 0);
        let currentAngle = -Math.PI / 2;
        
        values.forEach((value, index) => {
            const sliceAngle = (value / total) * 2 * Math.PI;
            
            ctx.fillStyle = data.datasets[0].backgroundColor[index] || `hsl(${index * 360 / values.length}, 70%, 50%)`;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();
            
            currentAngle += sliceAngle;
        });
    }

    update() {
        this.render();
    }

    destroy() {
        // Cleanup if needed
    }
}

// Make it available globally as Chart fallback
if (typeof Chart === 'undefined') {
    window.Chart = SimpleChart;
}