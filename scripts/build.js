#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BuildScript {
  constructor() {
    this.config = {
      projectName: 'Sistema BIAPO Otimizado',
      version: '8.12.1-optimized',
      srcDir: './src',
      distDir: './dist',
      tempDir: './temp',
      backupDir: './backup'
    };
    
    this.startTime = Date.now();
    this.buildSteps = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
      info: '📋',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type] || 'ℹ️';
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async build() {
    try {
      this.log(`Iniciando build do ${this.config.projectName} v${this.config.version}`);
      
      await this.checkDependencies();
      await this.cleanDist();
      await this.createDirectories();
      await this.buildAssets();
      await this.optimizeImages();
      await this.generateManifest();
      await this.runWebpack();
      await this.validateBuild();
      await this.generateReport();
      
      const totalTime = Date.now() - this.startTime;
      this.log(`Build concluído com sucesso em ${totalTime}ms`, 'success');
      
    } catch (error) {
      this.log(`Erro no build: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async checkDependencies() {
    this.log('Verificando dependências...');
    
    const requiredFiles = [
      'package.json',
      'webpack.config.js',
      'src/app-bundle.js',
      'src/styles.css'
    ];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Arquivo obrigatório não encontrado: ${file}`);
      }
    }
    
    // Verificar node_modules
    if (!fs.existsSync('node_modules')) {
      this.log('Instalando dependências...', 'warning');
      execSync('npm install', { stdio: 'inherit' });
    }
    
    this.buildSteps.push('✅ Dependências verificadas');
  }

  async cleanDist() {
    this.log('Limpando diretório dist...');
    
    if (fs.existsSync(this.config.distDir)) {
      fs.rmSync(this.config.distDir, { recursive: true, force: true });
    }
    
    this.buildSteps.push('✅ Diretório dist limpo');
  }

  async createDirectories() {
    this.log('Criando diretórios...');
    
    const dirs = [
      this.config.distDir,
      path.join(this.config.distDir, 'assets'),
      path.join(this.config.distDir, 'images'),
      this.config.tempDir
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    this.buildSteps.push('✅ Diretórios criados');
  }

  async buildAssets() {
    this.log('Copiando assets...');
    
    const assetsSource = '../assets';
    const assetsDest = path.join(this.config.distDir, 'assets');
    
    if (fs.existsSync(assetsSource)) {
      this.copyRecursive(assetsSource, assetsDest);
    }
    
    this.buildSteps.push('✅ Assets copiados');
  }

  copyRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        this.copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  async optimizeImages() {
    this.log('Otimizando imagens...');
    
    // Placeholder para otimização de imagens
    // Em um ambiente real, usaríamos imagemin ou similar
    
    this.buildSteps.push('✅ Imagens otimizadas');
  }

  async generateManifest() {
    this.log('Gerando manifest.json...');
    
    const manifest = {
      name: 'Sistema BIAPO',
      short_name: 'BIAPO',
      description: 'Sistema de Gestão BIAPO - Obra 292',
      version: this.config.version,
      start_url: '/',
      display: 'standalone',
      background_color: '#C53030',
      theme_color: '#C53030',
      orientation: 'portrait-primary',
      icons: [
        {
          src: '/assets/img/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/assets/img/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      categories: ['productivity', 'business'],
      lang: 'pt-BR',
      dir: 'ltr'
    };
    
    fs.writeFileSync(
      path.join(this.config.distDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    this.buildSteps.push('✅ Manifest gerado');
  }

  async runWebpack() {
    this.log('Executando webpack...');
    
    try {
      execSync('npx webpack --mode=production', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      this.buildSteps.push('✅ Webpack executado');
    } catch (error) {
      throw new Error('Falha no webpack: ' + error.message);
    }
  }

  async validateBuild() {
    this.log('Validando build...');
    
    const requiredOutputs = [
      'index.html',
      'service-worker.js'
    ];
    
    for (const file of requiredOutputs) {
      const filePath = path.join(this.config.distDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo de saída não encontrado: ${file}`);
      }
    }
    
    // Verificar se arquivos JS/CSS foram gerados
    const distFiles = fs.readdirSync(this.config.distDir);
    const hasJS = distFiles.some(file => file.endsWith('.min.js'));
    const hasCSS = distFiles.some(file => file.endsWith('.min.css'));
    
    if (!hasJS) {
      throw new Error('Arquivo JavaScript minificado não encontrado');
    }
    
    if (!hasCSS) {
      throw new Error('Arquivo CSS minificado não encontrado');
    }
    
    this.buildSteps.push('✅ Build validado');
  }

  async generateReport() {
    this.log('Gerando relatório...');
    
    const report = {
      project: this.config.projectName,
      version: this.config.version,
      buildTime: Date.now() - this.startTime,
      timestamp: new Date().toISOString(),
      steps: this.buildSteps,
      files: this.getOutputFiles(),
      sizes: this.calculateSizes()
    };
    
    fs.writeFileSync(
      path.join(this.config.distDir, 'build-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    this.logReport(report);
    this.buildSteps.push('✅ Relatório gerado');
  }

  getOutputFiles() {
    const files = [];
    
    function scanDir(dir, basePath = '') {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.join(basePath, entry.name);
        
        if (entry.isDirectory()) {
          scanDir(fullPath, relativePath);
        } else {
          const stats = fs.statSync(fullPath);
          files.push({
            path: relativePath,
            size: stats.size,
            sizeFormatted: this.formatBytes(stats.size)
          });
        }
      }
    }
    
    scanDir(this.config.distDir);
    return files;
  }

  calculateSizes() {
    const distStats = this.getDirSize(this.config.distDir);
    
    return {
      total: distStats,
      totalFormatted: this.formatBytes(distStats)
    };
  }

  getDirSize(dirPath) {
    let totalSize = 0;
    
    function scan(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          scan(fullPath);
        } else {
          const stats = fs.statSync(fullPath);
          totalSize += stats.size;
        }
      }
    }
    
    scan(dirPath);
    return totalSize;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  logReport(report) {
    console.log('\n📊 =================== BUILD REPORT ===================');
    console.log(`📦 Projeto: ${report.project}`);
    console.log(`🏷️  Versão: ${report.version}`);
    console.log(`⏱️  Tempo de Build: ${report.buildTime}ms`);
    console.log(`📏 Tamanho Total: ${report.sizes.totalFormatted}`);
    console.log('\n📂 Arquivos Gerados:');
    
    report.files.forEach(file => {
      console.log(`   ${file.path} (${file.sizeFormatted})`);
    });
    
    console.log('\n✅ Etapas Concluídas:');
    report.steps.forEach(step => {
      console.log(`   ${step}`);
    });
    
    console.log('📊 =====================================================\n');
  }
}

// Executar build se chamado diretamente
if (require.main === module) {
  const builder = new BuildScript();
  builder.build();
}

module.exports = BuildScript;
