Add-Type -AssemblyName System.Windows.Forms

$dialog = New-Object System.Windows.Forms.OpenFileDialog
$dialog.Title = "Select your founder photo"
$dialog.Filter = "Images|*.jpg;*.jpeg;*.png"

if ($dialog.ShowDialog() -eq 'OK') {
    $dest = "C:\Users\bachh\Desktop\Aveol\founder1.jpg"
    Copy-Item -Path $dialog.FileName -Destination $dest -Force
    Write-Host "Done! Photo saved as founder1.jpg in your Aveol folder."
} else {
    Write-Host "No file selected."
}
