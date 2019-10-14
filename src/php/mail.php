<?php
// Файлы phpmailer
require './PHPMailer.php';
require './SMTP.php';
require './Exception.php';
// Переменные, которые отправляет пользователь
$name = strip_tags(trim($_POST['name']));
$email = strip_tags(trim($_POST['email']));
$message = strip_tags(trim($_POST['message']));

$mail = new PHPMailer\PHPMailer\PHPMailer();

// Build POST request
$recaptcha_url = 'https://www.google.com/recaptcha/api/siteverify';
$recaptcha_secret = '6LdTNLcUAAAAAIXJThc781N00GwZwVbPiMh6wIRg';
$recaptcha_response = $_POST['recaptcha_response'];

// Make and decode POST request
$recaptcha = file_get_contents($recaptcha_url . '?secret=' . $recaptcha_secret . '&response=' . $recaptcha_response);
$recaptcha = json_decode($recaptcha);

if ($recaptcha->success) {
try {
    $msg = "Ваше сообщение отправлено! В ближайшее время менеджер свяжется с вами.";
    $mail->isSMTP();   
    $mail->CharSet = "UTF-8";                                          
    $mail->SMTPAuth   = true;
    // Настройки вашей почты
    $mail->Host       = 'smtp.yandex.ru'; // SMTP сервера GMAIL
    $mail->Username   = 'server-1@7thfloor.ru'; // Логин на почте
    $mail->Password   = 'wemwi6-sivmuZ-fujkaw'; // Пароль на почте
    $mail->SMTPSecure = 'ssl';
    $mail->Port       = 465;
    $mail->setFrom('server-1@7thfloor.ru', 'Веб-студия «Kaimana»'); // Адрес самой почты и имя отправителя
    // Получатель письма
    $mail->addAddress('contact@kaimana.ru'); 
    // $mail->addAddress('youremail@gmail.com'); // Ещё один, если нужен
        // -----------------------
        // Само письмо
        // -----------------------
        $mail->isHTML(true);
    
        $mail->Subject = 'Заявка с сайта kaimana.ru';
        $mail->Body    = "<b>Имя:</b> $name <br>
        <b>Почта:</b> $email<br><br>
        <b>Сообщение:</b><br>$message";
// Проверяем отравленность сообщения
if ($mail->send()) {
    echo "$msg";
} else {
echo "Сообщение не было отправлено. Неверно указаны настройки вашей почты";
}
} catch (Exception $e) {
    echo "Сообщение не было отправлено. Причина ошибки: {$mail->ErrorInfo}";
}
} else {
    echo "К сожалению, сообщение не может быть доставлено. Но мы всегда будем рады вашему звонку!";
}