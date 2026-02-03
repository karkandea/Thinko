export interface TutorialData {
  title: string;
  instructions: string[];
  time: string;
  cta: string;
}

export const TUTORIAL_CONTENT: Record<string, TutorialData> = {
  'schulte': {
    title: 'Tabel Schulte',
    instructions: [
      'Klik angka dari 1 sampai 25 secara berurutan',
      'Secepat mungkin, tanpa ngelewatin angka',
      'Fokus mata di tengah grid, jangan gerak-gerak',
      'Timer bakal jalan begitu lo mulai'
    ],
    time: '2-3 menit',
    cta: 'Mulai Main'
  },
  'chimp': {
    title: 'Tes Simpanse',
    instructions: [
      'Angka bakal muncul di layar selama beberapa detik',
      'Inget posisi semua angka sebelum hilang',
      'Klik angka dari yang terkecil ke terbesar',
      'Tiap level makin susah!'
    ],
    time: '3-5 menit',
    cta: 'Gas!'
  },
  'reaction': {
    title: 'Tes Reaksi',
    instructions: [
      'Tunggu sampai layar berubah dari merah jadi hijau',
      'Begitu hijau, langsung klik/tap secepet mungkin',
      'Jangan curang klik duluan ya!',
      'Bakal ada 5 round'
    ],
    time: '1 menit',
    cta: 'Siap!'
  },
  'visual': {
    title: 'Memori Visual',
    instructions: [
      'Beberapa kotak bakal nyala sebentar',
      'Inget pola kotaknya',
      'Klik kotak yang sama sesuai urutan',
      'Level selanjutnya makin banyak kotaknya'
    ],
    time: '3-4 menit',
    cta: 'Mulai Main'
  },
  'math': {
    title: 'Hitung Cepat',
    instructions: [
      'Selesaikan soal matematika sederhana',
      'lo cuma punya 3 detik per soal',
      'Klik jawaban yang bener',
      'Total 20 soal'
    ],
    time: '2 menit',
    cta: 'Oke, Gas!'
  },
  'stroop': {
    title: 'Tes Stroop',
    instructions: [
      'Bakal muncul kata warna, tapi tintanya warna beda',
      'PILIH WARNA TINTANYA, bukan baca tulisannya',
      'Jangan ketipu sama tulisannya ya',
      '20 round total'
    ],
    time: '2 menit',
    cta: 'Paham, Mulai!'
  }
};
