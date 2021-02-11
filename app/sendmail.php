<?php
  use PHPMailer\PHPMailer\PHPMailer;
  use PHPMailer\PHPMailer\Exception;

  require 'resources/phpmailer/src/Exception.php';
  require 'resources/phpmailer/src/PHPMailer.php';

  //Server settings
  // $mail->SMTPDebug = SMTP::DEBUG_SERVER;               // Включить подробный вывод отладки
  // $mail->isSMTP();                                     // Отправить через SMTP
  // $mail->Host       = 'smtp.example.com';              // Настройте SMTP-сервер для отправки через
  // $mail->SMTPAuth   = true;                            // Включить аутентификацию SMTP
  // $mail->Username   = 'user@example.com';              // Имя пользователя SMTP
  // $mail->Password   = 'secret';                        // Пароль SMTP
  // $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;  // Включить шифрование TLS; Рекомендуется PHPMailer :: ENCRYPTION_SMTPS.
  // $mail->Port       = 587;

  $mail = new PHPMailer(true);
  $mail->CharSet = 'UTF-8';
  $mail->setLanguage('ru', 'resources/phpmailer/language/');
  $mail->IsHTML(true);

  //От кого письмо
  $mail->setFrom('alexsross@yandex.ru', 'Фрилансер по жизни');
  //Кому отправить
  $mail->addAddress('all.shvets.st@gmail.com');
  //Тема письма
  $mail->Subject = 'Привет! Это "Фрилансер по жизни"';

  //Рука
  $hand = "Правая";
  if($_POST['hand'] == "left"){
    $hand = "Левая";
  }

  //Тело письма
  $body = '<h1>Встречайте супер письмо!</h1>';
  
  if(trim(!empty($_POST['name']))){
    $body.='<p><strong>Имя:</strong> '.$_POST['name'].'</p>';
  }
  if(trim(!empty($_POST['email']))){
    $body.='<p><strong>E-mail:</strong> '.$_POST['email'].'</p>';
  }
  if(trim(!empty($_POST['hand']))){
    $body.='<p><strong>Рука:</strong> '.$hand.'</p>';
  }
  if(trim(!empty($_POST['age']))){
    $body.='<p><strong>Возраст:</strong> '.$_POST['age'].'</p>';
  }
  
  if(trim(!empty($_POST['message']))){
    $body.='<p><strong>Сообщение:</strong> '.$_POST['message'].'</p>';
  }
  
  //Прикрепить файл
  if (!empty($_FILES['image']['tmp_name'])) {
    //путь загрузки файла
    $filePath = __DIR__ . "/img/" . $_FILES['image']['name']; 
    //грузим файл
    if (copy($_FILES['image']['tmp_name'], $filePath)){
      $fileAttach = $filePath;
      $body.='<p><strong>Фото в приложении</strong>';
      $mail->addAttachment($fileAttach);
    }
  }

  $mail->Body = $body;

  //Отправляем
  if (!$mail->send()) {
    $message = 'Ошибка';
  } else {
    $message = 'Данные отправлены!';
  }

  $response = ['message' => $message];

  header('Content-type: application/json');
  echo json_encode($response);
?>