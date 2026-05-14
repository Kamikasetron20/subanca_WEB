const supabaseClient = supabase.createClient(
  'https://piuztzpjgwouaplbxbqc.supabase.co', // SIN /rest/v1/
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpdXp0enBqZ3dvdWFwbGJ4YnFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5ODY1ODAsImV4cCI6MjA5MzU2MjU4MH0.3QVRdgikykyrql8nv0yx7ZdrskmZWdVi6XRWQJDgstk' // la que empieza por sb_publishable_ o tu anon
);
let uploadedImgs = [];
let editingPropertyId = null;

// ===== DATA =====
let allProps = [
  { id: 1, tipo: 'Apartamento', gestion: 'Arriendo', zona: 'El Poblado', nombre: 'Apartamento moderno en El Poblado', precio: 2800000, hab: 3, ban: 2, area: 85, park: 1, estrato: 5, nuevo: true, desc: 'Hermoso apartamento con acabados de lujo, cocina integral y zona de lavandería.', asesor: 'Sebastián Pernett' },
  { id: 2, tipo: 'Casa', gestion: 'Venta', zona: 'Laureles', nombre: 'Casa esquinera en Laureles', precio: 580000000, hab: 4, ban: 3, area: 220, park: 2, estrato: 5, nuevo: false, desc: 'Amplia casa en esquina con jardín privado y zona social.', asesor: 'Beatriz Elena Ruiz' },
  { id: 3, tipo: 'Apartamento', gestion: 'Arriendo', zona: 'Envigado', nombre: 'Apto familiar en Envigado', precio: 1600000, hab: 3, ban: 2, area: 78, park: 1, estrato: 4, nuevo: false, desc: 'Excelente ubicación cerca a colegios y centros comerciales.', asesor: 'Asesor Comercial' },
  { id: 4, tipo: 'Local', gestion: 'Arriendo', zona: 'Itagüí', nombre: 'Local comercial alta visibilidad', precio: 3200000, hab: 0, ban: 1, area: 120, park: 2, estrato: 3, nuevo: true, desc: 'Local a pie de vía con vitrina y depósito incluido.', asesor: 'Asesor Comercial 2' },
  { id: 5, tipo: 'Apartamento', gestion: 'Amoblado', zona: 'El Poblado', nombre: 'Estudio amoblado El Poblado', precio: 2100000, hab: 1, ban: 1, area: 42, park: 0, estrato: 5, nuevo: false, desc: 'Perfecto para ejecutivos o arrendamiento corto plazo.', asesor: 'Sebastián Pernett' },
  { id: 6, tipo: 'Casa', gestion: 'Arriendo', zona: 'Bello', nombre: 'Casa bifamiliar en Bello', precio: 1200000, hab: 3, ban: 2, area: 140, park: 1, estrato: 3, nuevo: false, desc: 'Piso independiente, patio privado y excelente iluminación natural.', asesor: 'Beatriz Elena Ruiz' },
  { id: 7, tipo: 'Bodega', gestion: 'Arriendo', zona: 'Itagüí', nombre: 'Bodega industrial en Itagüí', precio: 4500000, hab: 0, ban: 1, area: 400, park: 4, estrato: 2, nuevo: false, desc: 'Bodega con puerta seccional, portería y oficinas en segundo piso.', asesor: 'Asesor Comercial 2' },
  { id: 8, tipo: 'Apartamento', gestion: 'Venta', zona: 'Sabaneta', nombre: 'Apartamento nuevo en Sabaneta', precio: 320000000, hab: 2, ban: 2, area: 65, park: 1, estrato: 4, nuevo: true, desc: 'Proyecto sobre planos con entrega inmediata.', asesor: 'Asesor Comercial' },
  { id: 9, tipo: 'Casa', gestion: 'Venta', zona: 'Robledo', nombre: 'Casa en conjunto cerrado Robledo', precio: 420000000, hab: 3, ban: 2, area: 155, park: 2, estrato: 4, nuevo: false, desc: 'Conjunto con piscina, gimnasio y portería 24 horas.', asesor: 'Sebastián Pernett' },
  { id: 10, tipo: 'Apartamento', gestion: 'Arriendo', zona: 'Castilla', nombre: 'Apto amplio en Castilla', precio: 900000, hab: 2, ban: 1, area: 60, park: 0, estrato: 2, nuevo: false, desc: 'Muy bien ubicado cerca al metro y servicios.', asesor: 'Beatriz Elena Ruiz' },
  { id: 11, tipo: 'Oficina', gestion: 'Arriendo', zona: 'El Poblado', nombre: 'Oficina ejecutiva El Poblado', precio: 3800000, hab: 0, ban: 2, area: 90, park: 1, estrato: 5, nuevo: false, desc: 'Oficina con sala de juntas, recepción y vigilancia privada.', asesor: 'Asesor Comercial 2' },
  { id: 12, tipo: 'Apartamento', gestion: 'Amoblado', zona: 'Laureles', nombre: 'Apto amoblado Laureles', precio: 2600000, hab: 2, ban: 2, area: 72, park: 1, estrato: 5, nuevo: true, desc: 'Completamente equipado, smart TV, internet y parqueo.', asesor: 'Asesor Comercial' },
];

async function loadProperties() {

  const { data, error } = await supabaseClient
    .from('propiedades')
    .select('*')
    .order('created_at', { ascending: false });

  console.log(data);
  console.log(error);

  if (error) {

    console.error('Error cargando propiedades:', error);

    return;

  }

  allProps = data.map(p => ({

    id: p.id,

    imagenes: (() => {

      try {

        // si ya es array
        if (Array.isArray(p.imagenes)) {
          return p.imagenes.filter(Boolean);
        }

        // si viene como string JSON
        if (typeof p.imagenes === 'string') {

          const parsed = JSON.parse(p.imagenes);

          return Array.isArray(parsed)
            ? parsed.filter(Boolean)
            : [];
        }

        return [];

      } catch (e) {

        console.warn('Formato viejo de imagenes:', p.imagenes);

        return [];
      }

    })(),

    imagen:
      p.imagen ||
      p.imagen_url ||
      (() => {

        try {

          if (Array.isArray(p.imagenes) && p.imagenes.length > 0) {
            return p.imagenes[0];
          }

          if (typeof p.imagenes === 'string') {

            const parsed = JSON.parse(p.imagenes);

            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed[0];
            }
          }

        } catch (e) { }

        return null;

      })(),


    nombre: p.nombre,

    tipo: p.tipo,

    gestion: p.gestion,

    zona: p.zona,

    precio: p.precio,

    hab: p.habitaciones,

    ban: p.banos,

    area: p.area,

    park: p.parqueaderos,

    estrato: p.estrato,

    desc: p.descripcion,

    asesor: p.asesor,

    nuevo: true

  }));

  const container = document.getElementById('props-grid');

  if (container) {

    container.innerHTML = '';

  }

  renderProps(allProps);

}

let myProps = [...allProps]; // panel props
let currentFilter = 'todos';
let currentTab = 'arriendo';
let visibleCount = 6;
let filteredProps = [];
window.addEventListener('DOMContentLoaded', () => {

  const activeTab = document.querySelector('.search-tab.active');

  if (activeTab) {

    setTab(activeTab, 'arriendo');

  }

});

const asesores = [
  { nombre: 'Sebastián Pernett Ruiz', cargo: 'Gerente · Rep. Legal', cel: '3132211683' },
  { nombre: 'Maribel Jaramillo', cargo: 'Administradora', cel: '3132211683' },
  { nombre: 'Esneyder Calle', cargo: 'Asesor Comercial', cel: '3009508722' },
  { nombre: 'Santiago Pernett', cargo: 'Asesor Comercial', cel: '3112566539' },
];

// ===== FILTERS =====
function setTab(el, tab) {

  document
    .querySelectorAll('.search-tab')
    .forEach(b => b.classList.remove('active'));

  el.classList.add('active');

  currentTab = tab;

  const precio = document.getElementById('s-precio');

  let options = '';

  // =========================
  // ARRIENDO Y AMOBLADO
  // =========================

  if (tab === 'arriendo' || tab === 'amoblado') {

    options = `

  <option value="">
    Cualquier precio
  </option>

  <option value="0|500000">
    Menos de $500 mil
  </option>

  <option value="500000|1000000">
    $500 mil - $1M
  </option>

  <option value="1000000|1500000">
    $1M - $1.5M
  </option>

  <option value="1500000|2000000">
    $1.5M - $2M
  </option>

  <option value="2000000|2500000">
    $2M - $2.5M
  </option>

  <option value="2500000|3000000">
    $2.5M - $3M
  </option>

  <option value="3000000|3500000">
    $3M - $3.5M
  </option>

  <option value="3500000|4000000">
    $3.5M - $4M
  </option>

  <option value="4000000|4500000">
    $4M - $4.5M
  </option>

  <option value="4500000|5000000">
    $4.5M - $5M
  </option>

  <option value="5000000|6000000">
    $5M - $6M
  </option>

  <option value="6000000|7000000">
    $6M - $7M
  </option>

  <option value="7000000|8000000">
    $7M - $8M
  </option>

  <option value="8000000|9000000">
    $8M - $9M
  </option>

  <option value="9000000|10000000">
    $9M - $10M
  </option>

  <option value="10000000|999999999">
    Más de $10M
  </option>

`;

  }

  // =========================
  // VENTA
  // =========================

  else if (tab === 'venta') {

    options = `

  <option value="">
    Cualquier precio
  </option>

  <option value="0|200000000">
    Menos de $200M
  </option>

  <option value="200000000|300000000">
    $200M - $300M
  </option>

  <option value="300000000|400000000">
    $300M - $400M
  </option>

  <option value="400000000|600000000">
    $400M - $600M
  </option>

  <option value="600000000|800000000">
    $600M - $800M
  </option>

  <option value="800000000|1200000000">
    $800M - $1.200M
  </option>

  <option value="1200000000|9999999999">
    Más de $1.200M
  </option>

`;

  }

  precio.innerHTML = options;

}
function setFilter(el, filter) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  currentFilter = filter;
  visibleCount = 6;
  renderProps();
}
function applyFilters() {
  visibleCount = 6;
  renderProps();
  document.getElementById('propiedades').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function scrollToProps() {
  applyFilters();
}

function getFilteredProps() {
  const tipo = document.getElementById('s-tipo').value;
  const zona = document.getElementById('s-zona').value;
  const precioValue =
    document.getElementById('s-precio').value;

  let precioMin = 0;
  let precioMax = Infinity;

  if (precioValue) {

    const partes = precioValue.split('|');

    precioMin = parseInt(partes[0]) || 0;

    precioMax = parseInt(partes[1]) || Infinity;

  }

  return allProps.filter(p => {
    if (currentFilter !== 'todos') {
      if (p.gestion === currentFilter || p.tipo === currentFilter) { }
      else return false;
    }
    if (tipo && p.tipo !== tipo) return false;
    if (zona && p.zona !== zona) return false;
    if (
      p.precio < precioMin ||
      p.precio > precioMax
    ) return false;
    return true;
  });
}

function renderProps() {

  const filteredProps = getFilteredProps();

  const grid = document.getElementById('props-grid');

  const btn = document.getElementById('load-more-btn');

  const counter = document.getElementById('props-count');

  const shown = filteredProps.slice(0, visibleCount);

  counter.textContent =
    `${filteredProps.length} propiedad${filteredProps.length !== 1 ? 'es' : ''} encontrada${filteredProps.length !== 1 ? 's' : ''}`;

  grid.innerHTML = shown.map(p => propCard(p)).join('');

  btn.style.display =
    filteredProps.length > visibleCount ? 'block' : 'none';

}

function loadMore() { visibleCount += 6; renderProps(); }

function fmtPrice(p, g) {
  if (g === 'Venta') return '$' + (p >= 1000000 ? (p / 1000000).toFixed(0) + 'M' : p.toLocaleString('es-CO'));
  return '$' + p.toLocaleString('es-CO') + '/mes';
}

const colors = ['#C9D6E3', '#B8CCDC', '#9FBBCB', '#C3D4BE', '#D4C3BE', '#C3C3D4', '#D4C3C3'];

function propCard(p) {

  const image =
    p.imagen && p.imagen.trim() !== ''
      ? p.imagen
      : Array.isArray(p.imagenes) && p.imagenes.length > 0
        ? p.imagenes[0]
        : 'https://via.placeholder.com/600x400?text=Sin+Imagen';

  return `

<div class="prop-card" onclick="openModal('${p.id}')">

  <div
    class="prop-img"
    style="
      background-image:url('${image}');
      background-size:cover;
      background-position:center;
    ">

    <span class="prop-badge ${p.gestion === 'Arriendo' || p.gestion === 'Amoblado'
      ? 'badge-arriendo'
      : 'badge-venta'
    }">

      ${p.gestion}

    </span>

    ${p.nuevo
      ? '<span class="prop-badge badge-nuevo" style="left:auto;right:12px">Nuevo</span>'
      : ''
    }

    <div class="prop-fav" onclick="event.stopPropagation()">♡</div>

  </div>

  <div class="prop-body">

    <div class="prop-price">
      ${fmtPrice(p.precio, p.gestion)}
      <span>${p.estrato ? 'Estrato ' + p.estrato : ''}</span>
    </div>

    <div class="prop-name">${p.nombre}</div>

    <div class="prop-loc">📍 ${p.zona}</div>

    <div class="prop-details">

      ${p.hab > 0
      ? `<div class="prop-detail">🛏 <strong>${p.hab}</strong></div>`
      : ''
    }

      ${p.ban > 0
      ? `<div class="prop-detail">🚿 <strong>${p.ban}</strong></div>`
      : ''
    }

      <div class="prop-detail">
        📐 <strong>${p.area}m²</strong>
      </div>

      ${p.park > 0
      ? `<div class="prop-detail">🚗 <strong>${p.park}</strong></div>`
      : ''
    }

    </div>

  </div>

</div>

`;
}

// ===== MODAL =====
async function loadPropsFromDB() {

  console.log("🔥 cargando desde Supabase...");

  const { data, error } = await supabaseClient
    .from('propiedades')
    .select('*');

  if (error) {
    console.error('❌ ERROR DB:', error);
    return;
  }

  console.log("✅ DATA:", data);

  myProps = data.map(p => ({

    id: p.id,
    tipo: p.tipo,

    imagenes: (() => {

      try {

        if (Array.isArray(p.imagenes)) {
          return p.imagenes;
        }

        if (typeof p.imagenes === 'string') {

          const parsed = JSON.parse(p.imagenes);

          return Array.isArray(parsed)
            ? parsed
            : [];
        }

        return [];

      } catch (e) {

        console.error('ERROR imagenes:', p.imagenes);

        return [];
      }

    })(),

    imagen:
      p.imagen ||
      p.imagen_url ||
      (Array.isArray(p.imagenes) && p.imagenes.length > 0
        ? p.imagenes[0]
        : null) ||
      'https://via.placeholder.com/600x400?text=Sin+Imagen',

    gestion: p.gestion,
    zona: p.zona,
    nombre: p.nombre,
    precio: p.precio,

    hab: p.habitaciones || 0,
    ban: p.banos || 0,
    area: p.area || 0,
    park: p.parqueaderos || 0,

    estrato: p.estrato || 0,
    desc: p.descripcion || '',

    asesor: p.asesor || 'Asesor Comercial',

    nuevo: false

  }));

  allProps = [...myProps];

  console.log("✅ propiedades cargadas:", myProps);

  renderProps();

  document.getElementById('stat-props').textContent =
    myProps.length + '+';
}

function openModal(id) {

  const p = myProps.find(x => x.id === id);

  if (!p) return;

  const asesor = asesores.find(a => a.nombre === p.asesor) || asesores[0];

  const imagenPrincipal =
    p.imagen ||
    (Array.isArray(p.imagenes) ? p.imagenes[0] : null) ||
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1200&auto=format&fit=crop';

  console.log("MODAL PROPERTY:", p);

  document.getElementById('modal-content').innerHTML = `

  <button class="modal-close" onclick="closeModal()">✕</button>
  <div class="modal-gallery">

  <div class="gallery-main">

  <img
  id="main-property-image"
  src="${imagenPrincipal}" loading="lazy">

</div>

${Array.isArray(p.imagenes) && p.imagenes.length > 0
      ? `
      <div class="gallery-thumbs">

        ${p.imagenes.map(img => `

          <img
            class="${img === imagenPrincipal ? 'active-thumb' : ''}"

            src="${img}" loading="lazy"

            onclick="
              document.getElementById('main-property-image').src='${img}';

              document.querySelectorAll('.gallery-thumbs img')
                .forEach(el => el.classList.remove('active-thumb'));

              this.classList.add('active-thumb');
            "

            onmouseover="
              this.style.transform='translateY(-3px)';
              this.style.borderColor='#C8A75B';
            "

            onmouseout="
              this.style.transform='translateY(0)';
              this.style.borderColor='transparent';
            "

            style="
              width:120px;
              height:82px;
              object-fit:cover;
              border-radius:14px;
              cursor:pointer;
              flex-shrink:0;
              border:3px solid transparent;

              transition:
                transform .22s ease,
                border-color .22s ease,
                box-shadow .22s ease;

              box-shadow:
                0 6px 16px rgba(15,23,42,0.10);
            "
          >

        `).join('')}

      </div>
    `
      : ''
    }

<div style="height:20px"></div>

<div class="modal-topbar">

  <span class="prop-badge ${p.gestion !== 'Venta' ? 'badge-arriendo' : 'badge-venta'} badge-modal">
    ${p.gestion}
  </span>

  <div class="modal-location">
    📍 ${p.zona} · Estrato ${p.estrato}
  </div>

</div>

<h1 class="modal-title">
  ${p.nombre}
</h1>

<div class="modal-price">
  ${fmtPrice(p.precio, p.gestion)}

  <span>
    ${p.gestion === 'Venta' ? '' : '/ mes'}
  </span>
</div>

<div class="modal-layout">

  <!-- IZQUIERDA -->
  <div class="modal-main">

    <div class="modal-description">
      ${p.desc || 'Propiedad premium ubicada en excelente zona residencial.'}
    </div>

  </div>

  <!-- DERECHA -->
  <div class="modal-sidebar">

    <div class="modal-features">

      ${p.hab > 0 ? `
        <div class="modal-feature">
          <div class="modal-feature-label">
            Habitaciones
          </div>

          <div class="modal-feature-value">
            ${p.hab}
          </div>
        </div>
      ` : ''}

      ${p.ban > 0 ? `
        <div class="modal-feature">
          <div class="modal-feature-label">
            Baños
          </div>

          <div class="modal-feature-value">
            ${p.ban}
          </div>
        </div>
      ` : ''}

      <div class="modal-feature">
        <div class="modal-feature-label">
          Área
        </div>

        <div class="modal-feature-value">
          ${p.area} m²
        </div>
      </div>

      ${p.park > 0 ? `
        <div class="modal-feature">
          <div class="modal-feature-label">
            Parqueaderos
          </div>

          <div class="modal-feature-value">
            ${p.park}
          </div>
        </div>
      ` : ''}

      <div class="modal-feature">
        <div class="modal-feature-label">
          Asesor
        </div>

        <div class="modal-feature-value">
          ${asesor.nombre}
        </div>
      </div>

    </div>

    <a
      href="https://wa.me/57${asesor.cel}"
      target="_blank"
      class="modal-whatsapp"
    >
      💬 Contactar por WhatsApp
    </a>

  </div>

</div>

`;

  document.getElementById('modal-overlay').classList.add('open');

  document.body.style.overflow = 'hidden';


}


function closeModal(e) {
  if (e && e.target !== document.getElementById('modal-overlay')) return;
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ===== ASESORES =====
function renderAsesores() {
  document.getElementById('asesores-grid').innerHTML = asesores.map(a => {
    const initials = a.nombre.split(' ').map(x => x[0]).slice(0, 2).join('');
    return `<div class="asesor-card">
      <div class="asesor-avatar">${initials}</div>
      <h3>${a.nombre}</h3>
      <div class="cargo">${a.cargo}</div>
      <a href="https://wa.me/57${a.cel}" target="_blank" class="whatsapp">💬 WhatsApp</a>
    </div>`;
  }).join('');
}

// ===== CONTACT =====
function submitContact(e) {
  e.preventDefault();
  document.getElementById('contact-success').style.display = 'block';
  setTimeout(() => { document.getElementById('contact-success').style.display = 'none'; }, 5000);
}

// ===== PANEL =====
function doLogin() {
  const u = document.getElementById('login-user').value;
  const p = document.getElementById('login-pass').value;
  if ((u === 'asesor' || u.includes('@')) && p === '1234') {
    document.getElementById('panel-login').style.display = 'none';
    document.getElementById('panel-content').classList.add('visible');
    renderMyProps();
  } else {
    alert('Credenciales incorrectas. Use: asesor / 1234');
  }
}
function doLogout() {
  document.getElementById('panel-login').style.display = 'block';
  document.getElementById('panel-content').classList.remove('visible');
}

async function optimizeImage(file) {

  return new Promise((resolve) => {

    const img = new Image();

    img.onload = () => {

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const MAX_WIDTH = 1600;
      const MAX_HEIGHT = 1600;

      let width = img.width;
      let height = img.height;

      // Resize proporcional
      if (width > height) {

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

      } else {

        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }

      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a WebP comprimido
      canvas.toBlob(

        (blob) => {

          const optimizedFile = new File(

            [blob],

            file.name.replace(/\.[^/.]+$/, "") + '.webp',

            {
              type: 'image/webp'
            }

          );

          resolve(optimizedFile);

        },

        'image/webp',

        0.78

      );

    };

    img.src = URL.createObjectURL(file);

  });

}

async function optimizeImage(file) {

  return new Promise((resolve, reject) => {

    const img = new Image();

    const reader = new FileReader();

    reader.onload = (event) => {

      img.src = event.target.result;

    };

    img.onload = () => {

      // Tamaño máximo
      const MAX_WIDTH = 1600;
      const MAX_HEIGHT = 1200;

      let width = img.width;
      let height = img.height;

      // Resize inteligente
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {

        const ratio = Math.min(
          MAX_WIDTH / width,
          MAX_HEIGHT / height
        );

        width *= ratio;
        height *= ratio;
      }

      const canvas = document.createElement('canvas');

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');

      // Mejor calidad de render
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a WEBP
      canvas.toBlob(

        (blob) => {

          if (!blob) {

            reject(new Error('Error optimizando imagen'));

            return;
          }

          // Crear archivo WEBP final
          const optimizedFile = new File(

            [blob],

            file.name.replace(/\.\w+$/, '.webp'),

            {
              type: 'image/webp'
            }

          );

          console.log(
            `Optimizada: ${file.name}`,
            `Original: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
            `Nueva: ${(optimizedFile.size / 1024 / 1024).toFixed(2)} MB`
          );

          resolve(optimizedFile);

        },

        'image/webp',

        0.82 // calidad
      );
    };

    img.onerror = reject;

    reader.readAsDataURL(file);

  });
}

async function uploadImages(propertyId) {

  const uploadedUrls = [];

  console.log(uploadedImgs);

  for (const file of uploadedImgs) {

    console.log(file);

    const fileName = `${Date.now()}-${file.name}`;

    const filePath = `propiedades/${propertyId}/${fileName}`;

    const { error } = await supabaseClient
      .storage
      .from('subanca-assets')
      .upload(filePath, file);

    if (error) {

      console.error(error);

      continue;

    }

    const { data } = supabaseClient
      .storage
      .from('subanca-assets')
      .getPublicUrl(filePath);

    uploadedUrls.push(data.publicUrl);

    console.log(data);
    console.log(error);

  }

  return uploadedUrls;

}

async function previewImgs(e) {

  const preview = document.getElementById('img-preview');

  preview.innerHTML = '';

  uploadedImgs = [];

  const files = Array.from(e.target.files).slice(0, 10);

  for (const file of files) {

    // Optimizar automáticamente
    const optimized = await optimizeImage(file);

    uploadedImgs.push(optimized);

    const img = document.createElement('img');

    img.src = URL.createObjectURL(optimized);

    img.className = 'img-thumb';

    preview.appendChild(img);

  }

}

function saveDraft() {

  const draft = {

    gestion: document.getElementById('p-gestion')?.value || '',
    tipo: document.getElementById('p-tipo')?.value || '',
    estado: document.getElementById('p-estado')?.value || '',

    nombre: document.getElementById('p-nombre')?.value || '',
    zona: document.getElementById('p-zona')?.value || '',
    direccion: document.getElementById('p-dir')?.value || '',

    precio: document.getElementById('p-precio')?.value || '',
    hab: document.getElementById('p-hab')?.value || '',
    ban: document.getElementById('p-ban')?.value || '',

    area: document.getElementById('p-area')?.value || '',
    park: document.getElementById('p-park')?.value || '',
    estrato: document.getElementById('p-estrato')?.value || '',

    descripcion: document.getElementById('p-desc')?.value || '',
    asesor: document.getElementById('p-asesor')?.value || ''

  };

  localStorage.setItem(
    'subanca_property_draft',
    JSON.stringify(draft)
  );

}

function loadDraft() {

  const saved = localStorage.getItem('subanca_property_draft');

  if (!saved) return;

  const draft = JSON.parse(saved);

  if (document.getElementById('p-gestion'))
    document.getElementById('p-gestion').value = draft.gestion || '';

  if (document.getElementById('p-tipo'))
    document.getElementById('p-tipo').value = draft.tipo || '';

  if (document.getElementById('p-estado'))
    document.getElementById('p-estado').value = draft.estado || '';

  if (document.getElementById('p-nombre'))
    document.getElementById('p-nombre').value = draft.nombre || '';

  if (document.getElementById('p-zona'))
    document.getElementById('p-zona').value = draft.zona || '';

  if (document.getElementById('p-dir'))
    document.getElementById('p-dir').value = draft.direccion || '';

  if (document.getElementById('p-precio'))
    document.getElementById('p-precio').value = draft.precio || '';

  if (document.getElementById('p-hab'))
    document.getElementById('p-hab').value = draft.hab || '';

  if (document.getElementById('p-ban'))
    document.getElementById('p-ban').value = draft.ban || '';

  if (document.getElementById('p-area'))
    document.getElementById('p-area').value = draft.area || '';

  if (document.getElementById('p-park'))
    document.getElementById('p-park').value = draft.park || '';

  if (document.getElementById('p-estrato'))
    document.getElementById('p-estrato').value = draft.estrato || '';

  if (document.getElementById('p-desc'))
    document.getElementById('p-desc').value = draft.descripcion || '';

  if (document.getElementById('p-asesor'))
    document.getElementById('p-asesor').value = draft.asesor || '';

}

async function publishProp() {
  const nombre = document.getElementById('p-nombre').value.trim();
  if (!nombre) { alert('Ingrese el nombre o referencia del inmueble.'); return; }

  const propertyId = editingPropertyId || crypto.randomUUID();
  const imageUrls = await uploadImages(propertyId);
  const newProp = {

    id: propertyId,

    imagenes: imageUrls,

    nombre: nombre,

    tipo: document.getElementById('p-tipo').value,

    gestion: document.getElementById('p-gestion').value,

    zona: document.getElementById('p-zona').value,

    precio: parseInt(document.getElementById('p-precio').value) || 0,

    habitaciones: parseInt(document.getElementById('p-hab').value) || 0,

    banos: parseInt(document.getElementById('p-ban').value) || 0,

    area: parseInt(document.getElementById('p-area').value) || 0,

    parqueaderos: parseInt(document.getElementById('p-park').value) || 0,

    estrato: parseInt(document.getElementById('p-estrato').value) || 0,

    descripcion: document.getElementById('p-desc').value,

    asesor: document.getElementById('p-asesor').value,

    created_at: new Date().toISOString()

  };

  let error;

  if (editingPropertyId) {

    const response = await supabaseClient
      .from('propiedades')
      .update(newProp)
      .eq('id', editingPropertyId);

    error = response.error;

  } else {

    const response = await supabaseClient
      .from('propiedades')
      .insert([newProp]);

    error = response.error;

  }

  console.log(error);

  if (error) {

    alert('Error guardando inmueble');

    return;

  }

  document.getElementById('p-nombre').value = '';
  document.getElementById('p-precio').value = '';
  document.getElementById('p-desc').value = '';
  document.getElementById('img-preview').innerHTML = '';

  await loadProperties();

  renderProps();

  renderMyProps();

  editingPropertyId = null;

  const btn = document.getElementById('publish-btn');

  if (btn) {

    btn.textContent = 'Publicar inmueble';

  }
}

function renderMyProps() {
  const list = document.getElementById('my-props-list');
  if (myProps.length === 0) { list.innerHTML = '<p style="color:var(--text-muted);font-size:14px">No hay inmuebles publicados aún.</p>'; return; }
  list.innerHTML = myProps.slice(0, 8).map(p => `
    <div class="panel-prop-row">
      <div class="pp-info">
        <strong>${p.nombre}</strong>
        <span>${p.gestion} · ${p.tipo} · ${p.zona} · ${fmtPrice(p.precio, p.gestion)}</span>
      </div>
      <div class="pp-actions">
        <button class="btn-edit" onclick="editProp('${p.id}')">Editar</button>
        <button class="btn-del" onclick="deleteProp('${p.id}')">Eliminar</button>
      </div>
    </div>`).join('');
}

async function deleteProp(id) {

  if (!confirm('¿Eliminar este inmueble?')) return;

  // Buscar propiedad completa
  const prop = allProps.find(p => p.id === id);

  if (!prop) {

    alert('Propiedad no encontrada');

    return;

  }

  // Eliminar imágenes Storage
  if (prop.imagenes && prop.imagenes.length) {

    const paths = prop.imagenes.map(url => {

      console.log(url);

      const marker = '/storage/v1/object/public/subanca-assets/';

      const index = url.indexOf(marker);

      if (index === -1) {

        console.error('Path inválido:', url);

        return null;

      }

      const path = url.substring(index + marker.length);

      console.log(path);

      return path;

    }).filter(Boolean);

    const { error: storageError } = await supabaseClient
      .storage
      .from('subanca-assets')
      .remove(paths);

    console.log(storageError);

  }

  // Eliminar DB
  const { error } = await supabaseClient
    .from('propiedades')
    .delete()
    .eq('id', id);

  console.log(error);

  if (error) {

    alert('Error eliminando propiedad');

    return;

  }

  // Actualizar frontend
  allProps = props.filter(p => p.id !== id);

  myProps = myProps.filter(p => p.id !== id);

  renderProps();

  renderMyProps();
}

function editProp(id) {

  const prop = allProps.find(p => p.id === id);

  if (!prop) {

    alert('Propiedad no encontrada');

    return;

  }

  editingPropertyId = id;

  document.getElementById('p-nombre').value = prop.nombre || '';

  document.getElementById('p-tipo').value = prop.tipo || '';

  document.getElementById('p-gestion').value = prop.gestion || '';

  document.getElementById('p-zona').value = prop.zona || '';

  document.getElementById('p-precio').value = prop.precio || '';

  document.getElementById('p-hab').value = prop.hab || '';

  document.getElementById('p-ban').value = prop.ban || '';

  document.getElementById('p-area').value = prop.area || '';

  document.getElementById('p-park').value = prop.park || '';

  document.getElementById('p-estrato').value = prop.estrato || '';

  document.getElementById('p-desc').value = prop.desc || '';

  document.getElementById('p-asesor').value = prop.asesor || '';

  // Scroll panel
  document.getElementById('panel').scrollIntoView({
    behavior: 'smooth'
  });

  // Cambiar botón
  const btn = document.getElementById('publish-btn');

  if (btn) {

    btn.textContent = 'Guardar cambios';

  }

}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
  // Simple implementation
  const links = document.querySelector('.nav-links');
  if (links) {
    links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
    links.style.flexDirection = 'column';
    links.style.position = 'absolute';
    links.style.top = '68px';
    links.style.left = '0';
    links.style.width = '100%';
    links.style.background = 'rgba(26,39,68,0.98)';
    links.style.padding = '16px 5%';
    links.style.gap = '16px';
  }
}

// ===== INIT =====
renderProps();
renderAsesores();
document.getElementById('stat-props').textContent = myProps.length + '+';

// Nav scroll effect
window.addEventListener('scroll', () => {
  const nav = document.querySelector('nav');
  nav.style.boxShadow = window.scrollY > 40 ? '0 4px 24px rgba(0,0,0,0.25)' : 'none';
});

loadDraft();

setInterval(saveDraft, 3000);

loadPropsFromDB();

loadProperties();
