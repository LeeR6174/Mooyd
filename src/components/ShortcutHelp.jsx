import { X } from 'lucide-react';

export function ShortcutHelp({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content shortcut-help-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className="modal-title">ショートカット連携の設定</h2>
        
        <div className="help-scroll-area">
          <p className="help-intro">
            MooydはApple純正リマインダーと連携して動作します。
            タスクを追加・完了した際に実際のリマインダーアプリに反映させるため、以下の2つのiOSショートカットを作成してください。
          </p>

          <div className="help-section">
            <h3>1. 追加用ショートカット</h3>
            <p>スワイプの方向に応じて以下の2つのショートカットが必要です。</p>
            
            <div className="help-sub-section">
              <h4>A. 今日 (名前: <code>AddMooydTaskToday</code>)</h4>
              <ol>
                <li>アクション「新規リマインダーを追加」を配置。</li>
                <li>タイトル部分に「ショートカットの入力」を選択。</li>
                <li>「詳細を表示」から、期限を「現在の日付」に設定。</li>
              </ol>
            </div>

            <div className="help-sub-section">
              <h4>B. 日付指定 (名前: <code>AddMooydTaskDate</code>)</h4>
              <ol>
                <li>アクション「新規リマインダーを追加」を配置。</li>
                <li>タイトル部分に「ショートカットの入力」を選択。</li>
                <li>「詳細を表示」から、期限を「毎回尋ねる」に設定。</li>
              </ol>
            </div>
            <p className="help-note">
              ※すべて大文字小文字を正確に入力してください。<br />
              ※必要に応じてリストを「指定なし」から特定のリスト（例：受信トレイ）に変更してください。
            </p>
          </div>

          <div className="help-section">
            <h3>2. 完了・報酬付与用ショートカット</h3>
            <p><strong>名前:</strong> <code>CompleteMooydTask</code> (※大文字小文字を正確に)</p>
            <ol>
              <li>ショートカットアプリで新規作成し、名前に上記を設定。</li>
              <li>アクション「リマインダーを検索」を配置。<br/>条件：タイトルが「ショートカットの入力」と一致する。</li>
              <li>アクション「リマインダーを編集」を配置。<br/>設定：「完了済み」を「はい」にする。</li>
              <li>アクション「X-Callback URLを開く」を配置。<br/>URLには、変数「X-Success URL」を指定する。</li>
            </ol>
            <p className="help-note">
              ※これにより、完了時にMooydアプリに戻ってきてコインが付与されます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
