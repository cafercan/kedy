# 🐾 Kedy - İmleç Takip Eden Kedi (Chrome Eklentisi)

Bu Chrome eklentisi, referans GIF'teki gibi farenizi web sayfasında hareket ettirdikçe kafası ve gözleriyle imlecinizi canlı olarak takip eden sevimli bir masaüstü kedi dostudur.

---

## 🌟 Özellikler

- **🎯 Canlı Fare Takibi:** Kedinin kafası ve gözbebekleri, farenizi hareket ettirdiğiniz yöne doğru yumuşak (LERP) bir fizikle 360° döner ve bakar.
- **📏 Ayarlanabilir Boyut:** Eklenti menüsündeki kaydırıcı (slider) ile kedinin boyutunu istediğiniz gibi büyütebilir veya küçültebilirsiniz (veya sayfa üzerindeyken `Ctrl + Fare Tekerleği` ile anlık boyutlandırabilirsiniz).
- **🎨 Renk ve Cins / Tema Seçenekleri:** 
  - 🧡 **Sarman (Orange Tabby)** (Alında M çizgileri, sırt/gövde ve kuyrukta kaplan/tekir şeritleri, açık krem ağızlık ve bıyık detayları)
  - 🎩 **Smokinli (Tuxedo)** (Beyaz önlük, beyaz patiler ve sevimli burun detayı)
  - 🖤 **Gece Kedisi** (GIF'teki orijinal siyah renk)
  - 🤍 **Kar Beyazı**
  - 🌸 **Pembe Kedi** veya İstediğiniz Özel Renk
  - 👀 **Zümrüt Yeşili, Kehribar, Mavi veya Beyaz Göz Renkleri**
- **🖐️ Sürüklenebilir (Draggable):** Kediyi tutup sayfanın istediğiniz yerine bırakabilirsiniz. Konum tarayıcı hafızasında saklanır.
- **😻 Sevme & Kalp Çıkarma:** Kedinin üzerine tıkladığınızda mutlu mırıldanma/miyavlama sesi çıkarır ve sevimli kalpler/patiler fırlatır.
- **🔴 Lazer Noktası Modu:** Açıldığında imlecinizin ucunda kedinin dikkatle izlediği kırmızı bir lazer noktası belirir.
- **🪵 Tüneme Çubuğu (Ledge):** GIF'teki gibi şık beyaz tüneme çubuğunu açıp kapatabilirsiniz.
- **🛡️ İzole Tasarım (Shadow DOM):** Ziyaret ettiğiniz hiçbir web sitesinin CSS kuralları kedinin görünümünü bozamaz.

---

## 🚀 Chrome'a Nasıl Yüklenir?

### Yöntem 1: Paketlenmiş Dosya (.CRX) ile Hızlı Yükleme (Klasöre Çıkartma Gerektirmez)
1. [Releases sayfasından](https://github.com/cafercan/kedy/releases/latest) **`kedy-chrome-extension-v0.1.3.crx`** dosyasını indirin.
2. Google Chrome'da adres çubuğuna `chrome://extensions` yazıp **Enter**'a basın.
3. Sağ üst köşedeki **Geliştirici modu (Developer mode)** anahtarını açın.
4. İndirdiğiniz `.crx` dosyasını `chrome://extensions` sayfasının üzerine **sürükleyip bırakın (drag & drop)**.
5. Açılan onay kutusunda **"Uzantıyı Ekle"** butonuna tıklayın. Hazır!

---

### Yöntem 2: ZIP veya Kaynak Klasör ile Yükleme
1. [Releases sayfasından](https://github.com/cafercan/kedy/releases/latest) **`.zip`** dosyasını indirin ve klasöre çıkartın.
2. Chrome'da `chrome://extensions` adresine gidin ve **Geliştirici modu**nu açın.
3. Sol üstteki **Paketlenmemiş öge yükle (Load unpacked)** butonuna basarak çıkarttığınız klasörü seçin.

---

## 🧪 Tarayıcıda Doğrudan Test Etme

Eklentiyi yüklemeden önce veya anında canlı denemek için klasördeki `test.html` dosyasını çift tıklayarak herhangi bir tarayıcıda açabilirsiniz.
