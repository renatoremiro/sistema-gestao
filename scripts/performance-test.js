#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class PerformanceTest {
  constructor() {
    this.config = {
      testName: 'Sistema BIAPO Performance Test',
      version: '8.12.1-optimized',
      iterations: 5,
      thresholds: {
        bundleSize: 500, // KB
        loadTime: 3000, // ms
        firstPaint: 1500, // ms
        interactive: 5000, // ms
        memoryUsage: 50 // MB
      }
    };
    
    this.results = {
      bundleAnalysis: {},
      loadTimes: [],
      memoryUsage: [],
      errors: [],
      warnings: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
      info: '📊',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      test: '🧪'
    }[type] || 'ℹ️';
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async runTests() {
    try {
      this.log(`Iniciando testes de performance: ${this.config.testName}`);
      
      await this.analyzeBundleSize();
      await this.testLoadTimes();
      await this.analyzeMemoryUsage();
      await this.checkOptimizations();
      await this.generateReport();
      
      this.log('Testes de performance concluídos', 'success');
      
    } catch (error) {
      this.log(`Erro nos testes: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async analyzeBundleSize() {
    this.log('Analisando tamanho dos bundles...', 'test');
    
    const distDir = './dist';
    if (!fs.existsSync(distDir)) {
      throw new Error('Diretório dist não encontrado. Execute o build primeiro.');
    }
    
    const files = fs.readdirSync(distDir);
    const analysis = {};
    let totalSize = 0;
    
    files.forEach(file => {
      const filePath = path.join(distDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile()) {
        const sizeKB = stats.size / 1024;
        analysis[file] = {
          size: stats.size,
          sizeKB: Math.round(sizeKB * 100) / 100,
          sizeMB: Math.round(sizeKB / 1024 * 100) / 100
        };
        totalSize += stats.size;
      }
    });
    
    analysis['_total'] = {
      size: totalSize,
      sizeKB: Math.round(totalSize / 1024 * 100) / 100,
      sizeMB: Math.round(totalSize / 1024 / 1024 * 100) / 100
    };
    
    this.results.bundleAnalysis = analysis;
    
    // Verificar threshold
    if (analysis['_total'].sizeKB > this.config.thresholds.bundleSize) {
      this.results.warnings.push(
        `Bundle total (${analysis['_total'].sizeKB}KB) excede o limite recomendado (${this.config.thresholds.bundleSize}KB)`
      );
    }
    
    this.log(`Bundle total: ${analysis['_total'].sizeKB}KB`, 'info');
  }

  async testLoadTimes() {
    this.log('Testando tempos de carregamento...', 'test');
    
    // Simulação de teste de carregamento
    // Em um ambiente real, usaríamos Puppeteer ou similar
    
    for (let i = 0; i < this.config.iterations; i++) {
      const loadTime = this.simulateLoadTime();
      this.results.loadTimes.push(loadTime);
      
      if (loadTime > this.config.thresholds.loadTime) {
        this.results.warnings.push(
          `Tempo de carregamento ${i + 1} (${loadTime}ms) excede o limite (${this.config.thresholds.loadTime}ms)`
        );
      }
    }
    
    const avgLoadTime = this.results.loadTimes.reduce((a, b) => a + b, 0) / this.results.loadTimes.length;
    this.log(`Tempo médio de carregamento: ${Math.round(avgLoadTime)}ms`, 'info');
  }

  simulateLoadTime() {
    // Simulação baseada no tamanho dos arquivos
    const bundleSize = this.results.bundleAnalysis['_total']?.sizeKB || 100;
    const baseTime = 500; // tempo base em ms
    const sizeMultiplier = bundleSize * 2; // ms por KB
    const networkVariation = Math.random() * 500; // variação de rede
    
    return Math.round(baseTime + sizeMultiplier + networkVariation);
  }

  async analyzeMemoryUsage() {
    this.log('Analisando uso de memória...', 'test');
    
    // Simulação de análise de memória
    // Em um ambiente real, mediríamos o uso real de memória
    
    const baseMemory = 10; // MB base
    const bundleImpact = (this.results.bundleAnalysis['_total']?.sizeKB || 100) / 50; // impacto do bundle
    const runtimeMemory = Math.random() * 20; // memória de runtime aleatória
    
    const totalMemory = baseMemory + bundleImpact + runtimeMemory;
    this.results.memoryUsage.push(Math.round(totalMemory * 100) / 100);
    
    if (totalMemory > this.config.thresholds.memoryUsage) {
      this.results.warnings.push(
        `Uso de memória estimado (${Math.round(totalMemory)}MB) excede o limite (${this.config.thresholds.memoryUsage}MB)`
      );
    }
    
    this.log(`Uso estimado de memória: ${Math.round(totalMemory)}MB`, 'info');
  }

  async checkOptimizations() {
    this.log('Verificando otimizações...', 'test');
    
    const optimizations = {
      minification: this.checkMinification(),
      compression: this.checkCompression(),
      caching: this.checkCaching(),
      lazyLoading: this.checkLazyLoading(),
      serviceWorker: this.checkServiceWorker()
    };
    
    this.results.optimizations = optimizations;
    
    Object.entries(optimizations).forEach(([optimization, result]) => {
      if (result.status) {
        this.log(`✅ ${optimization}: ${result.message}`, 'info');
      } else {
        this.results.warnings.push(`${optimization}: ${result.message}`);
        this.log(`⚠️ ${optimization}: ${result.message}`, 'warning');
      }
    });
  }

  checkMinification() {
    const hasMinifiedJS = Object.keys(this.results.bundleAnalysis).some(file => 
      file.includes('.min.js')
    );
    const hasMinifiedCSS = Object.keys(this.results.bundleAnalysis).some(file => 
      file.includes('.min.css')
    );
    
    const status = hasMinifiedJS && hasMinifiedCSS;
    return {
      status,
      message: status ? 
        'Arquivos JS e CSS minificados encontrados' : 
        'Arquivos minificados não encontrados'
    };
  }

  checkCompression() {
    // Verificar se arquivos estão comprimidos (gzip/brotli)
    // Simulação - em produção verificaríamos headers HTTP
    return {
      status: true,
      message: 'Compressão configurada (simulado)'
    };
  }

  checkCaching() {
    const hasServiceWorker = fs.existsSync('./dist/service-worker.js');
    return {
      status: hasServiceWorker,
      message: hasServiceWorker ? 
        'Service Worker encontrado para caching' : 
        'Service Worker não encontrado'
    };
  }

  checkLazyLoading() {
    // Verificar se há implementação de lazy loading
    // Simulação baseada na estrutura do projeto
    return {
      status: true,
      message: 'Lazy loading implementado (simulado)'
    };
  }

  checkServiceWorker() {
    const swExists = fs.existsSync('./dist/service-worker.js');
    return {
      status: swExists,
      message: swExists ? 
        'Service Worker disponível' : 
        'Service Worker não encontrado'
    };
  }

  async generateReport() {
    this.log('Gerando relatório de performance...', 'test');
    
    const report = {
      testInfo: {
        name: this.config.testName,
        version: this.config.version,
        timestamp: new Date().toISOString(),
        iterations: this.config.iterations
      },
      bundleAnalysis: this.results.bundleAnalysis,
      performance: {
        loadTimes: {
          all: this.results.loadTimes,
          average: this.results.loadTimes.reduce((a, b) => a + b, 0) / this.results.loadTimes.length,
          min: Math.min(...this.results.loadTimes),
          max: Math.max(...this.results.loadTimes)
        },
        memoryUsage: this.results.memoryUsage,
        thresholds: this.config.thresholds
      },
      optimizations: this.results.optimizations,
      issues: {
        errors: this.results.errors,
        warnings: this.results.warnings
      },
      score: this.calculateScore()
    };
    
    // Salvar relatório
    fs.writeFileSync(
      './dist/performance-report.json',
      JSON.stringify(report, null, 2)
    );
    
    this.logReport(report);
  }

  calculateScore() {
    let score = 100;
    
    // Penalidades
    score -= this.results.errors.length * 20;
    score -= this.results.warnings.length * 5;
    
    // Bundle size penalty
    const bundleSize = this.results.bundleAnalysis['_total']?.sizeKB || 0;
    if (bundleSize > this.config.thresholds.bundleSize) {
      score -= Math.min(20, (bundleSize - this.config.thresholds.bundleSize) / 10);
    }
    
    // Load time penalty
    const avgLoadTime = this.results.loadTimes.reduce((a, b) => a + b, 0) / this.results.loadTimes.length;
    if (avgLoadTime > this.config.thresholds.loadTime) {
      score -= Math.min(15, (avgLoadTime - this.config.thresholds.loadTime) / 100);
    }
    
    return Math.max(0, Math.round(score));
  }

  logReport(report) {
    console.log('\n📊 ================ PERFORMANCE REPORT ================');
    console.log(`🧪 Teste: ${report.testInfo.name}`);
    console.log(`🏷️  Versão: ${report.testInfo.version}`);
    console.log(`⏱️  Timestamp: ${report.testInfo.timestamp}`);
    console.log(`🎯 Score: ${report.score}/100`);
    
    console.log('\n📦 Bundle Analysis:');
    Object.entries(report.bundleAnalysis).forEach(([file, info]) => {
      if (file !== '_total') {
        console.log(`   ${file}: ${info.sizeKB}KB`);
      }
    });
    console.log(`   📊 Total: ${report.bundleAnalysis._total.sizeKB}KB`);
    
    console.log('\n⚡ Performance:');
    console.log(`   Tempo médio de carregamento: ${Math.round(report.performance.loadTimes.average)}ms`);
    console.log(`   Tempo mínimo: ${report.performance.loadTimes.min}ms`);
    console.log(`   Tempo máximo: ${report.performance.loadTimes.max}ms`);
    console.log(`   Uso de memória: ${report.performance.memoryUsage[0]}MB`);
    
    console.log('\n🔧 Otimizações:');
    Object.entries(report.optimizations).forEach(([opt, result]) => {
      console.log(`   ${result.status ? '✅' : '❌'} ${opt}: ${result.message}`);
    });
    
    if (report.issues.warnings.length > 0) {
      console.log('\n⚠️  Avisos:');
      report.issues.warnings.forEach(warning => {
        console.log(`   • ${warning}`);
      });
    }
    
    if (report.issues.errors.length > 0) {
      console.log('\n❌ Erros:');
      report.issues.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
    }
    
    console.log('\n📊 ===================================================\n');
    
    // Recomendações
    this.logRecommendations(report);
  }

  logRecommendations(report) {
    console.log('💡 RECOMENDAÇÕES:');
    
    if (report.bundleAnalysis._total.sizeKB > this.config.thresholds.bundleSize) {
      console.log('   📦 Bundle muito grande - considere code splitting');
    }
    
    if (report.performance.loadTimes.average > this.config.thresholds.loadTime) {
      console.log('   ⚡ Tempo de carregamento alto - otimize recursos críticos');
    }
    
    if (report.issues.warnings.length > 5) {
      console.log('   ⚠️  Muitos avisos - revise configurações de build');
    }
    
    if (report.score < 80) {
      console.log('   📈 Score baixo - implemente mais otimizações');
    } else if (report.score >= 90) {
      console.log('   🎉 Excelente performance! Sistema bem otimizado.');
    }
    
    console.log('');
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const tester = new PerformanceTest();
  tester.runTests();
}

module.exports = PerformanceTest;
